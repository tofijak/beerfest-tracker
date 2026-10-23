import { Box, Card, CardContent, Typography } from "@mui/material";
import { PIXEL_FONT } from "../theme";
import { CopyBlock } from "./CopyBlock";
import { WebhookSettings } from "./WebhookSettings";

const NODE_VERIFY = `import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyBeerfestSignature(secret, rawBody, timestamp, signatureHeader) {
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = "sha256=" + createHmac("sha256", secret)
    .update(\`\${timestamp}.\${rawBody}\`)
    .digest("hex");
  const given = String(signatureHeader ?? "");
  if (expected.length !== given.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}`;

const PYTHON_VERIFY = `import hashlib, hmac, time

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
    return hmac.compare_digest(expected, given)`;

const GROK_PROMPT = `You are helping ME check a beer in on MY Untappd account.

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
- Never check in as anyone else. Never post to a friend or venue account.`;

const PAYLOAD_EXAMPLE = `{
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
}`;

function Guide({ title, children }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.75rem", color: "#ffd23f", mb: 1 }}>
          SETUP
        </Typography>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

export function Integrations({ user, festival, displayName, onSignIn }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Integrations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Send your committed ratings to a webhook you own. Your assistant can then check the beer in
        on <strong>your</strong> Untappd account. Beerfest Tracker never asks for or stores Untappd
        credentials. The full spec is <code>docs/webhooks.md</code> in the repo.
      </Typography>

      <WebhookSettings user={user} festival={festival} displayName={displayName} onSignIn={onSignIn} />

      <Guide title="What we send">
        <Typography variant="body2" color="text.secondary">
          POST JSON, version 1. Events: <code>rating.created</code>, <code>rating.updated</code>,{" "}
          <code>test</code>. Every delivery includes{" "}
          <code>X-Beerfest-Timestamp</code> (unix seconds) and <code>X-Beerfest-Signature</code>{" "}
          (<code>sha256=</code> hex HMAC of <code>timestamp + "." + body</code>), plus your optional
          receiver auth header.
        </Typography>
        <CopyBlock title="EXAMPLE BODY" code={PAYLOAD_EXAMPLE} />
      </Guide>

      <Guide title="Grok Bot routine">
        <Typography variant="body2" color="text.secondary" component="div">
          1. In Grok Bot, create a routine and add a <strong>webhook trigger</strong>.
          <br />
          2. Open the routine. Copy <strong>POST to</strong> (the URL) and the <strong>key</strong>.
          The panel also shows a ready-to-copy <code>Authorization: Bearer …</code> header.
          <br />
          3. Paste the URL here, set the auth header name to <code>Authorization</code>, and paste
          the key as the header value.
          <br />
          4. Enable, Save, then Send test event. A 200 means the routine started — check the Bot
          chat.
          <br />
          5. Paste the prompt below into the routine instruction. The Bot should use{" "}
          <strong>your</strong> browser session on Untappd, not a shared login.
        </Typography>
        <CopyBlock title="SAMPLE ROUTINE PROMPT" code={GROK_PROMPT} />
      </Guide>

      <Guide title="ChatGPT / OpenAI agents">
        <Typography variant="body2" color="text.secondary">
          ChatGPT and OpenAI agents do not accept a raw inbound webhook from this app. Bridge with
          n8n, Zapier, Make, or a tiny HTTPS function that your agent already polls or that starts
          an OpenAI run. Put this app&apos;s webhook URL on that bridge, verify the signature, then
          tell the agent to open <code>beer.untappdUrl</code> as <strong>you</strong> and check in
          the rating. Do not store Untappd passwords in the GPT or agent.
        </Typography>
      </Guide>

      <Guide title="Claude">
        <Typography variant="body2" color="text.secondary">
          Same pattern: verify the signature on a small HTTPS receiver, then start a Claude
          computer-use / browser job, or pass the payload into a Claude Project tool. The job must
          use the Untappd session in <strong>your</strong> browser. If Claude is not signed in as
          you, it should stop.
        </Typography>
      </Guide>

      <Guide title="n8n">
        <Typography variant="body2" color="text.secondary">
          Add a <strong>Webhook</strong> node (POST, JSON). Use that production URL here. Add a
          Code node that verifies <code>X-Beerfest-Signature</code> with the snippet below. Then
          branch on <code>event</code>: ignore <code>test</code>, otherwise call your assistant or
          a browser automation that checks in on your Untappd. Optional: send the Grok / agent
          Authorization header as well.
        </Typography>
      </Guide>

      <Guide title="Zapier">
        <Typography variant="body2" color="text.secondary">
          Create a Zap with <strong>Webhooks by Zapier → Catch Hook</strong>. Paste the Catch Hook
          URL here (https). Zapier will receive the JSON. Add a filter for{" "}
          <code>event</code> is not <code>test</code>, then a step that talks to your assistant or
          a browser tool. Zapier does not verify HMAC by default — keep the Zap private and prefer
          a Zapier Code step that checks the signature.
        </Typography>
      </Guide>

      <Guide title="Make">
        <Typography variant="body2" color="text.secondary">
          Add a <strong>Custom webhook</strong> trigger, copy the https URL here, and map
          <code>beer.untappdUrl</code>, <code>rating</code>, and <code>festival.venue</code> into
          the next module (HTTP to your assistant, or a browser scenario). Add a filter so{" "}
          <code>test</code> events only ping you.
        </Typography>
      </Guide>

      <Guide title="Verify the signature">
        <Typography variant="body2" color="text.secondary">
          Signed payload is <code>{"${timestamp}.${rawBody}"}</code> (unix seconds, then a dot,
          then the exact JSON bytes). Header: <code>X-Beerfest-Signature: sha256=&lt;hex&gt;</code>.
          Reject timestamps older than 5 minutes.
        </Typography>
        <CopyBlock title="NODE" code={NODE_VERIFY} />
        <CopyBlock title="PYTHON" code={PYTHON_VERIFY} />
      </Guide>
    </Box>
  );
}
