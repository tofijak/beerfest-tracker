import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  loadWebhookSettings,
  rotateWebhookSecret,
  saveWebhookSettings,
  sendWebhookTest,
} from "../lib/webhookSettings";
import { PIXEL_FONT } from "../theme";

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <Box sx={{ mt: 1.5 }}>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={value}
        InputProps={{ readOnly: true }}
      />
      <Button
        size="small"
        sx={{ mt: 1 }}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </Box>
  );
}

export function WebhookSettings({ user, festival, displayName, onSignIn }) {
  const [status, setStatus] = useState("loading");
  const [enabled, setEnabled] = useState(false);
  const [url, setUrl] = useState("");
  const [headerName, setHeaderName] = useState("Authorization");
  const [headerValue, setHeaderValue] = useState("");
  const [meta, setMeta] = useState(null);
  const [revealedSecret, setRevealedSecret] = useState("");
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    loadWebhookSettings(user)
      .then((data) => {
        if (cancelled) return;
        setMeta(data);
        setEnabled(Boolean(data.enabled));
        setHeaderName(data.headerName || "Authorization");
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage({ tone: "error", text: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const run = async (work, okText) => {
    setBusy(true);
    setMessage(null);
    try {
      const data = await work();
      setMeta(data.hasUrl != null ? data : meta);
      if (data.signingSecret) setRevealedSecret(data.signingSecret);
      if (data.hasUrl != null) {
        setEnabled(Boolean(data.enabled));
        setHeaderName(data.headerName || "Authorization");
        setUrl("");
        setHeaderValue("");
      }
      if (okText) setMessage({ tone: "success", text: okText });
      return data;
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
      return null;
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your webhook
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sign in to send your own ratings to a webhook you control — a Grok Bot routine, n8n,
            Zapier, or anything that accepts HTTPS POST. Beerfest Tracker never asks for Untappd
            credentials.
          </Typography>
          <Button variant="contained" onClick={onSignIn}>
            Sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.75rem", color: "#ffd23f", mb: 1 }}>
          YOUR WEBHOOK
        </Typography>
        <Typography variant="h6" gutterBottom>
          Forward ratings to your assistant
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          HTTPS only. The URL and receiver key stay on the server (other people cannot read them).
          A signing secret is shown once so you can verify deliveries. Your assistant acts on{" "}
          <strong>your</strong> Untappd account, in your browser — not ours.
        </Typography>

        {status === "loading" ? (
          <Typography variant="body2" color="text.secondary">
            Loading webhook settings…
          </Typography>
        ) : null}

        {status === "error" && message ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        ) : null}

        {status === "ready" ? (
          <>
            <FormControlLabel
              control={<Switch checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />}
              label={enabled ? "Enabled" : "Disabled"}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Webhook URL"
              placeholder="https://…"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              helperText={
                meta?.hasUrl
                  ? `Saved host: ${meta.urlHost}. Leave blank to keep it.`
                  : "https only. Private, loopback, and local addresses are blocked."
              }
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Receiver auth header name"
              value={headerName}
              onChange={(event) => setHeaderName(event.target.value)}
              helperText="Grok Bot routines use Authorization (Bearer + the routine key). Match whatever the webhook panel shows."
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              size="small"
              type="password"
              autoComplete="new-password"
              label="Receiver auth header value"
              value={headerValue}
              onChange={(event) => setHeaderValue(event.target.value)}
              helperText={
                meta?.hasAuthValue
                  ? "A key is saved. Leave blank to keep it; we never show it again."
                  : "Optional. For Grok Bot, paste the routine key."
              }
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                disabled={busy}
                onClick={() =>
                  run(
                    () =>
                      saveWebhookSettings(user, {
                        enabled,
                        url: url.trim(),
                        headerName: headerName.trim(),
                        headerValue: headerValue.trim(),
                      }),
                    "Saved.",
                  )
                }
              >
                {busy ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outlined"
                disabled={busy || !meta?.enabled}
                onClick={() =>
                  run(
                    () => sendWebhookTest(user, { festival, userDisplayName: displayName }),
                    "Test event sent.",
                  )
                }
              >
                Send test event
              </Button>
              <Button
                variant="outlined"
                disabled={busy || !meta?.hasUrl}
                onClick={() =>
                  run(() => rotateWebhookSecret(user), "New signing secret — copy it now.")
                }
              >
                Regenerate signing secret
              </Button>
            </Box>
            {meta?.hasSigningSecret && !revealedSecret ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Signing secret is set (ends with …{meta.signingSecretSuffix}). It is only shown when
                created.
              </Typography>
            ) : null}
            <CopyField
              label="Signing secret — shown once"
              value={revealedSecret}
            />
            {revealedSecret ? (
              <Alert severity="warning" sx={{ mt: 1.5 }}>
                Copy this now. We will not show the full secret again.
              </Alert>
            ) : null}
          </>
        ) : null}

        {status === "ready" && message ? (
          <Alert severity={message.tone === "error" ? "error" : "success"} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
