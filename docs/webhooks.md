# Rating webhooks

Any signed-in person can forward their own committed ratings to an HTTPS webhook they control. Typical use: a personal assistant (Grok Bot routine, n8n, Zapier, …) checks the beer in on **that person’s own Untappd account**, in **their** browser.

Beerfest Tracker never asks for or stores Untappd credentials.

In the app: open the **Integrations** tab (`#integrations`).

**Firestore rules in this repo must be published manually** in the Firebase console. Vercel does not deploy them.

## Vercel env vars

Server-only. Do **not** prefix with `VITE_`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | to enable storage + delivery | Service account JSON (or base64 of that JSON) so the function can read/write each user’s webhook secrets. Admin SDK bypasses client rules. |
| `FIREBASE_PROJECT_ID` | no | Firebase project id for ID-token checks. Falls back to existing `VITE_FIREBASE_PROJECT_ID`. |

Create a Firebase service account (Project settings → Service accounts → Generate new private key). Paste the JSON into `FIREBASE_SERVICE_ACCOUNT` on the Vercel project.

Without `FIREBASE_SERVICE_ACCOUNT`, rating saves still work. Settings API returns `503`. Delivery is a no-op (`204`).

There is no global owner allowlist and no shared `RATING_HOOK_URL`. Each user pastes their own URL and receiver key in the app.

## Firestore

| Path | Client | Server (service account) |
| --- | --- | --- |
| `users/{uid}/integrations/webhook` | **Read** only. Status: enabled, host, header name, whether secrets exist. Never contains the URL or keys. | Read/write |
| `users/{uid}/integrations/webhookSecrets` | **No access.** | Read/write: `url`, `headerName`, `headerValue`, `signingSecret`, `enabled` |

Publish `firestore.rules` from this repo in the Firebase console after merging. Until that is published, a client could still read `users/{uid}/**` including a secrets doc if one existed — do not store secrets until the new rules are live.

## Delivery

After a signed-in user commits a rating (slider drags are coalesced), the browser fire-and-forgets:

`POST /api/rating-hook`  
`Authorization: Bearer <Firebase ID token>`

The function verifies the JWT against Google’s securetoken certs, loads **that** user’s `webhookSecrets`, and POSTs to their URL when enabled. Disabled / missing config → `204`. Failures never block saving a rating.

Rate limit: 20 deliveries / minute / user, 8 test events / minute / user.

SSRF: `https` only, default port 443, no userinfo, no localhost / loopback / link-local / private / CGNAT IPs, no `.local` / `.internal` hosts, DNS result checked, redirects disabled, 5s timeout.

## Payload (version 1)

```json
{
  "version": 1,
  "event": "rating.created",
  "userDisplayName": "Alex",
  "festival": {
    "slug": "raise-the-bar-2026",
    "name": "Raise the Bar",
    "venue": "Ridehuset, Aarhus"
  },
  "beer": {
    "id": 102,
    "name": "Zenne d’Auge",
    "brewery": "3 Fonteinen",
    "style": "Calvados BA lambic",
    "abv": 8.5,
    "session": "green",
    "untappdUrl": "https://untappd.com/b/example/1"
  },
  "rating": 4.25,
  "note": null,
  "timestamp": "2026-10-23T10:00:00.000Z"
}
```

| Field | Notes |
| --- | --- |
| `event` | `rating.created` first score, `rating.updated` later change, `test` from **Send test event** |
| `note` | Per-rating comment. The app does not collect one today, so it is `null` |
| `beer.session` | Festival session id (`green`, `yellow`, …) |
| `beer.untappdUrl` | From the festival file when known |

## Signature

Every outbound POST includes:

| Header | Value |
| --- | --- |
| `X-Beerfest-Timestamp` | Unix time in seconds |
| `X-Beerfest-Signature` | `sha256=<hex>` HMAC-SHA256 of `timestamp + "." + raw body` |
| *(optional custom)* | Header name + value the user saved (Grok Bot: `Authorization: Bearer <routine key>`) |

The signing secret is generated per user, shown **once** in the Integrations tab, and can be regenerated. GET settings never returns it.

Reject deliveries older than 5 minutes.

### Node

```js
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyBeerfestSignature(secret, rawBody, timestamp, signatureHeader) {
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = "sha256=" + createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const given = String(signatureHeader ?? "");
  if (expected.length !== given.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}
```

### Python

```python
import hashlib, hmac, time

def verify_beerfest_signature(secret, raw_body, timestamp, signature_header):
    try:
        ts = int(timestamp)
    except (TypeError, ValueError):
        return False
    if abs(int(time.time()) - ts) > 300:
        return False
    expected = "sha256=" + hmac.new(
        secret.encode(), f"{ts}.{raw_body}".encode(), hashlib.sha256
    ).hexdigest()
    given = signature_header or ""
    return hmac.compare_digest(expected, given)
```

## Easy install

### Grok Bot

1. Create a routine with a **webhook trigger**.
2. Copy **POST to** and the **key**. The panel also offers a full `Authorization: Bearer …` header.
3. In Integrations: paste the URL, header name `Authorization`, header value = the key. Enable → Save → Send test event.
4. Routine instruction (copy-paste):

```
You are helping ME check a beer in on MY Untappd account.

This routine is triggered by a webhook from Beerfest Tracker. The JSON body is version 1.

Rules:
- Act only as me, in my browser, on the Untappd account I am already signed into.
- Beerfest Tracker never asks for or stores Untappd passwords. Do not ask me for Untappd credentials. If Untappd is signed out, stop and tell me to sign in myself.
- If event is "test": reply that the webhook works. Do not open Untappd.
- If event is "rating.created" or "rating.updated":
  1. Prefer beer.untappdUrl. If it is null, search Untappd for beer.name by beer.brewery.
  2. Check the beer in at festival.venue with the given rating (0.25 steps).
  3. Use note as the check-in comment when it is not null.
  4. If I already checked this beer in today at this venue, skip.
- Never check in as anyone else. Never post to a friend or venue account.
```

A `200` from Grok means the run started, not that Untappd finished.

### ChatGPT / OpenAI agents

No native inbound webhook. Use n8n / Zapier / Make / a small HTTPS function as the catcher, verify the signature, then start an agent run that opens `beer.untappdUrl` as **you**. Do not put Untappd passwords in the GPT.

### Claude

Same bridge: verify signature, then start a Claude browser / computer-use job on your Untappd session. Stop if Claude is not signed in as you.

### n8n

Webhook node (POST, JSON) → Code node with the snippet above → branch on `event` → your assistant or browser automation.

### Zapier

**Webhooks by Zapier → Catch Hook**. Paste that https URL. Filter out `test`. Add a Code step to verify HMAC if you can; keep the Zap private.

### Make

**Custom webhook** trigger. Map `beer.untappdUrl`, `rating`, `festival.venue`. Filter `test` events to a ping-only route.

## Settings API

All routes require `Authorization: Bearer <Firebase ID token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/webhook-settings` | Sanitized status (no URL, no keys) |
| `PUT` | `/api/webhook-settings` | `{ enabled, url?, headerName?, headerValue? }` — omit `url` / `headerValue` to keep saved secrets. First save returns `signingSecret` once. |
| `POST` | `/api/webhook-settings` | `{ "action": "test", "festival", "userDisplayName" }` or `{ "action": "rotate-secret" }` |

```bash
npm test
```
