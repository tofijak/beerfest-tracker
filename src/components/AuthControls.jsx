import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

export function AuthControls({ auth }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  if (!auth.configured) return null;

  const signedIn = Boolean(auth.user);

  return (
    <>
      {signedIn ? (
        <Tooltip title={auth.user.email || "Signed in"}>
          <Chip
            label={auth.user.email?.split("@")[0] || "Signed in"}
            onDelete={auth.logout}
            deleteIcon={<LogoutIcon />}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "#fff", maxWidth: 140, mr: 1 }}
          />
        </Tooltip>
      ) : (
        <Tooltip title="Sign in with a magic link">
          <IconButton color="inherit" onClick={() => setOpen(true)} aria-label="Sign in">
            {auth.pendingLink ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
          </IconButton>
        </Tooltip>
      )}

      <Dialog open={open && !signedIn} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Sign in with a magic link</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We email you a one-time link. Ratings on this device merge into your account on first
            sign-in, then sync across phones.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={auth.busy}
          />
          {auth.emailSent ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Link sent. Open it on this device if you can.
            </Alert>
          ) : null}
          {auth.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {auth.error}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button
            variant="contained"
            disabled={auth.busy || !email.includes("@")}
            onClick={() => auth.sendLink(email.trim())}
          >
            {auth.busy ? "Sending…" : "Send magic link"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={auth.needsEmail} fullWidth maxWidth="xs">
        <DialogTitle>Confirm your email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This magic link was opened on a new device. Type the email you asked the link for.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="email"
            label="Email"
            value={confirmEmail}
            onChange={(event) => setConfirmEmail(event.target.value)}
          />
          {auth.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {auth.error}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            disabled={auth.busy || !confirmEmail.includes("@")}
            onClick={() => auth.completeLink(confirmEmail.trim())}
          >
            {auth.busy ? "Signing in…" : "Finish sign-in"}
          </Button>
        </DialogActions>
      </Dialog>

      {auth.pendingLink && !auth.needsEmail ? (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(27, 94, 32, 0.72)",
            color: "#fff",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CircularProgress color="inherit" />
          <Typography>Signing you in…</Typography>
        </Box>
      ) : null}
    </>
  );
}
