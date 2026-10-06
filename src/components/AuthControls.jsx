import { useState } from "react";
import { Button, Chip, IconButton, IconLogin, IconLogout, Input, Sheet, useToast } from "../ui";

export function AuthControls({ auth }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const toast = useToast();

  if (!auth.configured) return null;

  const signedIn = Boolean(auth.user);

  return (
    <>
      {signedIn ? (
        <Chip as="button" type="button" onClick={auth.logout} title={auth.user.email || "Signed in"}>
          {auth.user.email?.split("@")[0] || "In"}
          <IconLogout size={14} />
        </Chip>
      ) : (
        <IconButton aria-label="Sign in" onClick={() => setOpen(true)}>
          <IconLogin />
        </IconButton>
      )}

      <Sheet open={open && !signedIn} onClose={() => setOpen(false)} title="Sign in with a magic link">
        <p className="lede">
          We email you a one-time link. Ratings on this device merge into your account on first
          sign-in, then sync across phones.
        </p>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={auth.busy}
        />
        {auth.emailSent ? (
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            Link sent. Open it on this device if you can.
          </p>
        ) : null}
        {auth.error ? (
          <p style={{ color: "var(--danger)", marginTop: "0.75rem" }}>{auth.error}</p>
        ) : null}
        <div className="cluster" style={{ marginTop: "1.25rem" }}>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button
            variant="primary"
            disabled={auth.busy || !email.includes("@")}
            onClick={async () => {
              const sent = await auth.sendLink(email.trim());
              if (sent) toast.push("Magic link sent — check your inbox.", "success");
            }}
          >
            {auth.busy ? "Sending…" : "Send magic link"}
          </Button>
        </div>
      </Sheet>

      <Sheet open={auth.needsEmail} onClose={() => {}} title="Confirm your email">
        <p className="lede">
          This magic link was opened on a new device. Type the email you asked the link for.
        </p>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={confirmEmail}
          onChange={(event) => setConfirmEmail(event.target.value)}
        />
        {auth.error ? (
          <p style={{ color: "var(--danger)", marginTop: "0.75rem" }}>{auth.error}</p>
        ) : null}
        <div style={{ marginTop: "1.25rem" }}>
          <Button
            variant="primary"
            disabled={auth.busy || !confirmEmail.includes("@")}
            onClick={() => auth.completeLink(confirmEmail.trim())}
          >
            {auth.busy ? "Signing in…" : "Finish sign-in"}
          </Button>
        </div>
      </Sheet>

      {auth.pendingLink && !auth.needsEmail ? (
        <div className="splash" style={{ cursor: "default" }}>
          <p>Signing you in…</p>
        </div>
      ) : null}
    </>
  );
}
