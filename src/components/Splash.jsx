import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { PIXEL_FONT } from "../theme";
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
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 3 }, mb: 4 }}>
        <PixelSprite sprite="mug" size={120} depth={10} />
        <Typography
          component="span"
          sx={{
            fontFamily: PIXEL_FONT,
            fontWeight: 700,
            fontSize: { xs: "2rem", sm: "3rem" },
            color: "#ff2bd6",
            textShadow: "2px 2px 0 #a0128a, 4px 4px 0 #6a0b5c, 6px 6px 0 #2a1458",
          }}
        >
          ×
        </Typography>
        <PixelSprite sprite="logo" size={170} depth={12} />
      </Box>
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
