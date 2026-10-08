import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { PixelBackdrop, PixelSprite } from "./PixelArt";

export function Splash({ open, festival, onDismiss }) {
  const [leaving, setLeaving] = useState(false);
  if (!open || !festival) return null;

  const leave = () => {
    if (leaving) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onDismiss();
      return;
    }
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      onDismiss();
    }, 480);
  };

  return (
    <Box
      onClick={leave}
      sx={{
        animation: leaving ? "splashOut 480ms ease-in forwards" : "none",
        pointerEvents: leaving ? "none" : "auto",
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        textAlign: "center",
        backgroundColor: "#07070f",
        backgroundImage: "radial-gradient(circle at 50% 30%, #1d0f3a 0%, #07070f 70%)",
        color: "#e6ecff",
        cursor: "pointer",
      }}
    >
      <PixelBackdrop />
      <PixelSprite sprite="mug" size={140} depth={10} sx={{ mb: 3, position: "relative" }} />
      <Typography variant="overline" sx={{ position: "relative", letterSpacing: 3, mb: 1, color: "#00e5ff" }}>
        {festival.name}
        {festival.edition ? ` · ${festival.edition}` : ""}
      </Typography>
      <Typography variant="h4" sx={{ position: "relative", fontWeight: 700, mb: 2, maxWidth: 520 }}>
        {festival.tagline || "Check it. Star it. Rate it."}
      </Typography>
      <Typography variant="body1" sx={{ position: "relative", maxWidth: 440, mb: 4, color: "#9aa4c7" }}>
        {festival.splashBody ||
          [festival.venue, festival.dateLabel || festival.date].filter(Boolean).join(" · ")}
      </Typography>
      <Button variant="contained" color="secondary" sx={{ position: "relative", borderRadius: 999, px: 3 }}>
        {festival.splashCta || "Let's go"}
      </Button>
    </Box>
  );
}
