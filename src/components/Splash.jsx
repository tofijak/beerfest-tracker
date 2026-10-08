import { useState } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { festivalStats, knownBeerIds } from "../festivals";
import { hasFestivalActivity, idsOnMenu, ratedCountFrom, ratingsOnMenu } from "../lib/storage";
import { PIXEL_FONT } from "../theme";
import { PixelBackdrop, PixelSprite } from "./PixelArt";

export function Splash({ open, festivals, resumeSlug, allProgress, onSelect }) {
  const [leaving, setLeaving] = useState(false);

  if (!open) return null;

  const choose = (slug) => {
    if (leaving) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onSelect(slug);
      return;
    }
    setLeaving(true);
    setTimeout(() => onSelect(slug), 480);
  };

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-labelledby="landing-title"
      sx={{
        animation: leaving ? "splashOut 480ms ease-in forwards" : "none",
        pointerEvents: leaving ? "none" : "auto",
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
        py: { xs: 3, sm: 5 },
        overflow: "auto",
        textAlign: "center",
        backgroundColor: "#07070f",
        backgroundImage: "radial-gradient(circle at 50% 18%, #1d0f3a 0%, #07070f 68%)",
        color: "#e6ecff",
      }}
    >
      <PixelBackdrop />
      <PixelSprite sprite="mug" size={120} depth={10} sx={{ mb: 2, position: "relative" }} />
      <Typography
        id="landing-title"
        variant="overline"
        sx={{ position: "relative", letterSpacing: 3, color: "#00e5ff" }}
      >
        Beerfest Tracker
      </Typography>
      <Typography
        variant="h4"
        sx={{ position: "relative", fontWeight: 700, mt: 1, mb: 1, maxWidth: 520 }}
      >
        Check it. Star it. Rate it.
      </Typography>
      <Typography variant="body1" sx={{ position: "relative", maxWidth: 460, mb: 3, color: "#9aa4c7" }}>
        Which festival are you at?
      </Typography>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 520,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          textAlign: "left",
        }}
      >
        {festivals.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center">
            No festivals loaded yet.
          </Typography>
        ) : (
          festivals.map((festival) => {
            const stats = festivalStats(festival);
            const progress = allProgress?.[festival.slug];
            const started = hasFestivalActivity(progress);
            const menuIds = knownBeerIds(festival);
            const rated = ratedCountFrom(ratingsOnMenu(progress?.beerRatings, menuIds));
            const tried = idsOnMenu(progress?.drunkBeers, menuIds).length;
            const isCurrent = festival.slug === resumeSlug;
            return (
              <Box
                key={festival.slug}
                component="button"
                type="button"
                onClick={() => choose(festival.slug)}
                sx={{
                  width: "100%",
                  p: 2,
                  color: "inherit",
                  font: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                  backgroundColor: "rgba(16, 12, 38, 0.88)",
                  border: "3px solid",
                  borderColor: isCurrent ? "#ff2bd6" : "#00e5ff",
                  boxShadow: "6px 6px 0 #2a1458",
                  transition: "transform 60ms, box-shadow 60ms, border-color 120ms",
                  "&:hover": { borderColor: "#ffd23f" },
                  "&:active": { transform: "translate(3px, 3px)", boxShadow: "0 0 0 #2a1458" },
                  "&:focus-visible": { outline: "3px solid #ffd23f", outlineOffset: 3 },
                }}
              >
                <Box
                  component="span"
                  sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}
                >
                  <Typography
                    component="span"
                    sx={{ fontFamily: PIXEL_FONT, fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.2 }}
                  >
                    {festival.name}
                    {festival.edition ? ` ${festival.edition}` : ""}
                  </Typography>
                  {isCurrent ? (
                    <Chip
                      component="span"
                      label="Continue"
                      size="small"
                      color="secondary"
                      sx={{ flexShrink: 0 }}
                    />
                  ) : null}
                </Box>
                <Typography component="span" variant="body2" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                  {[festival.venue, festival.dateLabel || festival.date].filter(Boolean).join(" · ")}
                </Typography>
                <Typography component="span" variant="body2" sx={{ display: "block", mt: 1, color: "#c5cee8" }}>
                  {stats.beerCount} beers · {stats.breweryCount} breweries
                  {started ? ` · ${rated} rated · ${tried} tried` : ""}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
