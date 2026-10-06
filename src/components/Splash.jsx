import { Box, Button, Typography } from "@mui/material";

export function Splash({ open, onDismiss }) {
  if (!open) return null;

  return (
    <Box
      onClick={onDismiss}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        textAlign: "center",
        backgroundImage: "linear-gradient(160deg, #1b5e20 0%, #114d16 55%, #f9a825 140%)",
        color: "#e8f5e9",
        cursor: "pointer",
      }}
    >
      <Typography variant="overline" sx={{ letterSpacing: 3, mb: 1, color: "#c8e6c9" }}>
        Serpier × Raise the Bar
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, maxWidth: 520 }}>
        Fri bar 17–21 — planlæg hvad I skal smage
      </Typography>
      <Typography variant="body1" sx={{ maxWidth: 440, mb: 4, color: "#c8e6c9" }}>
        Ridehuset, Aarhus · fredag 9. oktober 2026. Rate øl undervejs og lås holdet op.
      </Typography>
      <Button variant="contained" color="secondary" onClick={onDismiss} sx={{ borderRadius: 999, px: 3 }}>
        Vi er klar
      </Button>
    </Box>
  );
}
