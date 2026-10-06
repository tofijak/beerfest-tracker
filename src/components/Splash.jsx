import { Box, Button, Typography } from "@mui/material";
import { PixelBackdrop, PixelSprite } from "./PixelArt";

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
        backgroundColor: "#07070f",
        backgroundImage: "radial-gradient(circle at 50% 30%, #1d0f3a 0%, #07070f 70%)",
        color: "#e6ecff",
        cursor: "pointer",
      }}
    >
      <PixelBackdrop />
      <PixelSprite sprite="mug" size={140} depth={10} sx={{ mb: 3, position: "relative" }} />
      <Typography variant="overline" sx={{ position: "relative", letterSpacing: 3, mb: 1, color: "#00e5ff" }}>
        Serpier × Raise the Bar
      </Typography>
      <Typography variant="h4" sx={{ position: "relative", fontWeight: 700, mb: 2, maxWidth: 520 }}>
        Fri bar 17–21 — planlæg hvad I skal smage
      </Typography>
      <Typography variant="body1" sx={{ position: "relative", maxWidth: 440, mb: 4, color: "#9aa4c7" }}>
        Ridehuset, Aarhus · fredag 9. oktober 2026. Rate øl undervejs og lås holdet op.
      </Typography>
      <Button variant="contained" color="secondary" onClick={onDismiss} sx={{ position: "relative", borderRadius: 999, px: 3 }}>
        Vi er klar
      </Button>
    </Box>
  );
}
