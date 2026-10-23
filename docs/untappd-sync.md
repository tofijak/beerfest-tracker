# Sync Beerfest Tracker ratings to Untappd with your own AI agent

Beerfest Tracker has no Untappd integration of its own and **never asks for or stores Untappd credentials**.
Instead, your own AI agent (Grok Bot, ChatGPT agent, Claude with computer use, or any agent that can drive a
browser) signs in to both sites in *its own browser* and keeps them in sync on a schedule:

1. It reads your ratings from the export page in Beerfest Tracker.
2. It compares them with its own log.
3. It checks in the missing beers on **your** Untappd account, and tells you when an existing check-in needs
   an edit (for example after you change a rating).

No webhooks, servers, API keys or extra secrets are involved. You stay in control: sign the agent out of
Untappd (or revoke the session in Untappd's settings) and the sync stops.

## The export page

| What | Value |
| --- | --- |
| All festivals | `https://beerfest-tracker.vercel.app/?tab=export` |
| One festival | `https://beerfest-tracker.vercel.app/?tab=export&festival=<slug>` |
| Element to read | `<pre id="ratings-export-json" data-status="ready">` |
| In the app | History tab → “Export my ratings · Sync with Untappd” |

Current festival slugs: `aarhus-together-2026`, `raise-the-bar-2026` (one per file in `src/festivals/`).

The page shows the signed-in user's own data, read from their account (Firestore) and merged with what is
saved on that device, exactly like the rest of the app. Signed out, it shows a sign-in prompt
(`#ratings-export-signed-out`) instead of the JSON. When Firebase is not configured (local dev), it exports
the data saved on the device (`"source": "device"`). There is no pagination.

The page also has **Copy** and **Download** buttons for humans.

### JSON shape (`exportVersion: 1`)

```json
{
  "exportVersion": 1,
  "exportedAt": "2026-10-23T15:30:00.000Z",
  "source": "account",
  "user": { "email": "you@example.com", "displayName": "Your board name" },
  "festivals": [
    {
      "slug": "aarhus-together-2026",
      "name": "Aarhus Together",
      "edition": "2026",
      "date": "2026-10-23",
      "venue": "Comwell Centralværkstedet, Aarhus",
      "updatedAt": "2026-10-23T15:29:41.000Z",
      "ratings": [
        {
          "beerId": 163,
          "name": "2024 Bourbon County Original Stout",
          "brewery": "Goose Island Beer Co.",
          "style": "Stout - Bourbon Barrel Aged",
          "abv": 14.7,
          "session": "friday",
          "untappdUrl": "https://untappd.com/b/goose-island-beer-co-bourbon-county-brand-original-stout-2024/5944213",
          "untappdSearchUrl": "https://untappd.com/search?q=2024%20Bourbon%20County%20Original%20Stout%20Goose%20Island%20Beer%20Co.&type=beer",
          "rating": 4.5,
          "favorite": true,
          "tasted": true
        }
      ]
    }
  ]
}
```

Notes:

- `ratings` lists every beer you rated, starred or checked off. `rating` is `null` when it was never rated,
  and `0` when the rating is set to zero. Beers with `rating: null` are not checked in; `rating: 0` is checked in
  without a rating.
- `beerId` is stable within a festival. Use `"<slug>:<beerId>"` as the sync key.
- `untappdUrl` is `null` when the beer isn't matched on Untappd; only then fall back to `untappdSearchUrl` (confident matches only).
- `updatedAt` is when that festival's ratings were last saved to your account (`null` for device data).
  Individual ratings have no timestamp.
- Beers that were removed from a festival's list are left out.

## Set up the sync

### 1. Give the agent its own sign-ins

- **Beerfest Tracker:** in the agent's browser, open the app, tap the sign-in icon and enter your email. Forward
  the magic-link email to your agent (or paste the link to it) and let it open the link in that same browser.
  If the link opens in a different browser, the app asks to confirm the email address.
- **Untappd:** let the agent open untappd.com and sign in as you. Type the password yourself or use your
  password manager's autofill. Don't paste it into a chat and don't let the agent store it.

### 2. Schedule it

Run every **15–30 minutes during festival hours** (for example Aarhus Together: Fri 17–21, Sat 11–15 and 17–21,
plus a final run after closing). Turn the schedule off after the festival.

### 3. Check-in rules

- **Comment** every check-in with the festival name and edition, e.g. `Raise the Bar 2026` or
  `Aarhus Together 2026` (`name` + `edition` from the export).
- **Find the beer** with the app's own Untappd link (`untappdUrl`) first. Only if it is `null`, use
  `untappdSearchUrl` or search by brewery + beer name, and continue only on a confident match. Names can differ in
  apostrophes, accents and punctuation (e.g. `’` vs `'`, `ø` vs `o`, `é` vs `e`). Unsure → skip and report.
- **Rating:** `0` means check in **without** a rating (Untappd's minimum is 0.25). Anything else is rounded to the
  nearest 0.25.
- **Location:** the festival `venue`, if Untappd offers it. The website's "Add your location" picker needs browser
  geolocation; if that is unavailable, skip the venue.
- **Sharing:** if any share toggles are present (Facebook, X/Twitter, Foursquare), turn them all off. The web
  check-in dialog may not show any.
- **Log** each check-in under `"<slug>:<beerId>"` with the rating posted, the Untappd check-in URL and ID, and
  the time, so it can be edited later.
- **Rating changed** in the app for a beer that is already checked in → **never delete or re-post.** The Untappd
  website can't edit check-ins (the "…" menu only offers Delete), so the agent logs the new rating as a pending
  edit and tells you, with the check-in URL. You edit it in the Untappd mobile app (new rating rounded to 0.25,
  or no rating if it became 0). Agents that have the Untappd mobile app or API available may edit it themselves.
- **Missing comment** on a logged check-in → same: don't delete or re-post; tell you (or edit via the app/API).
- **Never double check-in.** Before posting, and before retrying a check-in that may have failed, look at your
  recent Untappd activity.

### 4. Paste this prompt

Replace `<festival-slug>`, `<festival venue>` and the festival name/edition.

```text
You are my Beerfest Tracker → Untappd sync agent. Work only in your own browser, on my own accounts.

ONE-TIME SETUP
- Sign in to Beerfest Tracker (https://beerfest-tracker.vercel.app) with a magic link sent to my email. Ask me to forward the link to you. Never ask for a password.
- Sign in to untappd.com as me. I enter my Untappd login myself (or via my password manager). Never write it down, store it in notes, or log it.
- Create a sync log you keep between runs (a file or memory), keyed by "<festival slug>:<beerId>". For each entry store the rating you posted, the Untappd check-in URL and ID, and the time.

EVERY RUN (every 15–30 minutes during festival hours)
1. Open https://beerfest-tracker.vercel.app/?tab=export&festival=<festival-slug>
   Wait for the element #ratings-export-json with data-status="ready" and parse its text as JSON.
   If you see a sign-in prompt instead, stop and tell me the Beerfest Tracker session expired.
2. Rating rule: a rating of 0 means check in WITHOUT a rating (Untappd's minimum is 0.25). Any other rating is rounded to the nearest 0.25 (0.25–5).
3. For each beer in festivals[].ratings where "rating" is not null:
   a. Key = "<slug>:<beerId>". If the key is NOT in the log:
      - Find the beer: always use the app's own link (untappdUrl) first. Only if untappdUrl is null, use untappdSearchUrl or search Untappd by brewery + beer name, and continue only on a confident match (same brewery and same beer; names may differ in apostrophes, accents or punctuation). If you are not sure, skip it and report it.
      - Before checking in, look at my recent Untappd activity to make sure it is not already checked in from this festival. If it is, add that check-in to the log instead of posting.
      - Check in with the rating from the rating rule.
      - Comment: "<festival name> <edition>" (e.g. "Aarhus Together 2026") on every check-in.
      - Location: "<festival venue>" if Untappd offers it. The "Add your location" picker needs browser geolocation; if that is unavailable, skip the venue.
      - If any share toggles are present (Facebook, X/Twitter, Foursquare), turn them all off.
      - Add the key to the log with the rating, the check-in URL and ID, and the time.
   b. If the key IS in the log and the rating changed: never delete or re-post the check-in. The Untappd website cannot edit check-ins (its "…" menu only offers Delete). Record the new rating in the log as a pending edit and tell me, with the check-in URL, so I can edit it in the Untappd mobile app (new rating rounded to the nearest 0.25, or no rating if it became 0). Only if you have the Untappd mobile app or API available, edit the check-in yourself and update the log.
   c. If a logged check-in was posted without the festival comment: same as above. Do not delete or re-post; tell me (or edit it yourself only via the Untappd app/API).
4. Never check in the same beer twice. If a check-in might have failed, verify on Untappd before retrying.
5. Report briefly: new check-ins, pending edits for me (rating changes, missing comments, with check-in URLs), skipped beers (no confident match). Stay quiet if nothing changed.
```

The same prompt, already filled in with the current festival slug, venue and check-in comment, is on the export page under
**Sync with Untappd** with a **Copy prompt** button.

## Per-harness tips

- **Grok Bot:** ask it to set up a scheduled routine with the prompt above. It uses its own browser for both
  sign-ins and can keep the sync log as a file on its computer.
- **ChatGPT agent:** start an agent task with the prompt, sign in to both sites in the agent's browser when it
  asks (take over the browser to type your Untappd password), then make it a scheduled task.
- **Claude with computer use / a browser:** run it in a long-lived browser profile so both sessions survive
  between runs, keep the log as a file in that environment, and trigger it with your scheduler of choice.
- **Generic agents (Playwright, browser-use, n8n + a browser node, ...):** use a persistent browser profile,
  wait for `#ratings-export-json[data-status="ready"]`, `JSON.parse` its `textContent`, and store the log as a
  JSON file keyed by `"<slug>:<beerId>"`.

## Good to know

- Untappd's terms apply to your agent's activity. Keep the volume to your own real check-ins.
- The rating scale in Beerfest Tracker is 0.25 steps, the same as Untappd, so rounding rarely changes anything.
  A rating set to 0 is posted without a rating.
- Sessions expire. If either sign-in drops, the agent should stop and ask you instead of guessing.
