import { Box, Button, Typography } from "@mui/material";

export function Splash({ open, festival, onDismiss }) {
  if (!open || !festival) return null;

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
        {festival.name}
        {festival.edition ? ` · ${festival.edition}` : ""}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, maxWidth: 520 }}>
        {festival.tagline || "Check it. Star it. Rate it."}
      </Typography>
      <Typography variant="body1" sx={{ maxWidth: 440, mb: 4, color: "#c8e6c9" }}>
        {festival.splashBody ||
          [festival.venue, festival.dateLabel || festival.date].filter(Boolean).join(" · ")}
      </Typography>
      <Button variant="contained" color="secondary" onClick={onDismiss} sx={{ borderRadius: 999, px: 3 }}>
        {festival.splashCta || "Let's go"}
      </Button>
    </Box>
  );
}
