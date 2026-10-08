import { Box, Button, Checkbox, Chip, Dialog, DialogContent, FormControlLabel, Slider, Typography } from "@mui/material";
import { sessionMeta, standColor, ratingColor, styleCategory } from "../utils";
import { BODY_FONT, PIXEL_FONT } from "../theme";
import { PixelIcon, PixelIconButton } from "./PixelIcons";
import { CrtTransition } from "./CrtTransition";
import { StandBadge, StyleBadge, pixelCheckboxProps } from "./PixelUI";

function Stat({ label, value, color }) {
  return (
    <Box sx={{ flex: 1, minWidth: 90, p: 1.5, border: "3px solid #07070f", bgcolor: color ?? "#241a4d", color: color ? "#07070f" : "#eef1ff", boxShadow: "3px 3px 0 #2a1458" }}>
      <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: "1.8rem", lineHeight: 1.15, fontVariantNumeric: "tabular-nums" }}>{value}</Typography>
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", opacity: 0.8, fontVariantNumeric: "tabular-nums" }}>{label}</Typography>
    </Box>
  );
}

export function BeerDialog({ festival, entry, drunkBeers, favoriteBeers, plannedBeers, beerRatings, onToggleDrunk, onToggleFavorite, onTogglePlan, onRatingChange, onClose }) {
  const { beer, brewery } = entry ?? {};
  const open = Boolean(entry);
  const untappd = beer?.untappd ?? null;
  const session = beer ? sessionMeta(festival, beer.session) : null;
  const description = beer?.description ?? null;
  const myRating = beer ? beerRatings[beer.id] || 0 : 0;
  const isTried = beer && drunkBeers.includes(beer.id);
  const isFavorite = beer && favoriteBeers.includes(beer.id);
  const isPlanned = beer && plannedBeers.includes(beer.id);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper" slots={{ transition: CrtTransition }}
      PaperProps={{ className: "crt-paper", sx: { position: "relative", m: { xs: 1.5, sm: 4 }, border: `3px solid ${beer ? standColor(brewery.stand) : "#00e5ff"}`, boxShadow: "6px 6px 0 #2a1458", backgroundImage: "linear-gradient(160deg,#0b1a2e,#1d0f3a)", "&::after": { content: '""', position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)", animation: "crtFlicker 3s steps(6) infinite" } } }}>
      {beer && (
        <DialogContent sx={{ position: "relative" }}>
<Box sx={{ position: "absolute", top: 12, right: 12 }}>
            <PixelIconButton icon="close" label="Close" onClick={onClose} size={34} iconSize={16} />
          </Box>
          <Typography variant="overline" sx={{ color: standColor(brewery.stand) }}>
            {brewery.name} · {brewery.location} · stand {brewery.stand}
          </Typography>
          <Typography variant="h5" sx={{ pr: 5, mb: 1.5, overflowWrap: "anywhere", fontFamily: BODY_FONT, fontSize: { xs: "1.55rem", sm: "1.9rem" }, lineHeight: 1.25 }}>
            {beer.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip size="small" label={session.label} sx={{ bgcolor: session.color, color: beer.session === "yellow" ? "#3e2723" : "#fff" }} />
            <StandBadge stand={brewery.stand} size="large" />
            <StyleBadge category={styleCategory(beer)} size="large" />
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
            <Stat label={untappd?.count != null ? `Untappd · ${untappd.count} ratings` : "Untappd"} value={untappd?.rating != null ? untappd.rating.toFixed(2) : "n/a"} color={untappd?.rating != null ? ratingColor(untappd.rating) : undefined} />
            <Stat label="Your rating" value={myRating > 0 ? myRating.toFixed(2) : "–"} color={myRating > 0 ? "#ffd23f" : undefined} />
            <Stat label="ABV" value={typeof beer.abv === "number" ? `${beer.abv}%` : "n/a"} />
          </Box>
          <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.75rem", color: "#ffd23f", mt: 1, mb: 0.5 }}>ABOUT</Typography>
          {description ? (
            <Typography variant="body2" sx={{ mb: 1, p: 1.5, bgcolor: "rgba(0,229,255,0.08)", borderLeft: "4px solid #00e5ff" }}>
              {description.text}
              {description.source && (
                <Box component="a" href={description.source} target="_blank" rel="noopener noreferrer" sx={{ display: "block", mt: 0.5, fontSize: "0.7rem", color: "#9aa4c7" }}>
                  source
                </Box>
              )}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              No write-up found for this one yet.
            </Typography>
          )}
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Style:</strong> {beer.style || "TBA"}
          </Typography>
          {beer.notes && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Notes:</strong> {beer.notes}
            </Typography>
          )}
          <Box sx={{ mt: 2, p: 1.5, border: "3px solid #ffd23f", bgcolor: "rgba(255,210,63,0.06)" }}>
            <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.75rem", color: "#ffd23f" }}>
              YOUR RATING {myRating > 0 ? myRating.toFixed(2) : ""}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isTried ? "Drag to rate." : "Drag to rate — this also marks it as tried."}
            </Typography>
            <Slider
              value={myRating}
              min={0}
              max={5}
              step={0.25}
              marks={[0, 1, 2, 3, 4, 5].map((value) => ({ value, label: String(value) }))}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => value.toFixed(2)}
              onChange={(_event, value) => {
                const next = typeof value === "number" ? Math.round(value * 4) / 4 : 0;
                if (next > 0 && !isTried) onToggleDrunk(beer.id);
                onRatingChange(beer.id, next);
              }}
              sx={{ mt: 1, "& .MuiSlider-mark": { display: "none" } }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 2 }}>
            <FormControlLabel control={<Checkbox {...pixelCheckboxProps} checked={drunkBeers.includes(beer.id)} onChange={() => onToggleDrunk(beer.id)} />} label="Tried" />
            <Button size="small" variant="contained" color={isFavorite ? "warning" : "primary"} startIcon={<PixelIcon name="star" size={16} />} onClick={() => onToggleFavorite(beer.id)}>
              Favorite
            </Button>
            <Button size="small" variant="contained" color={isPlanned ? "success" : "primary"} startIcon={<PixelIcon name={isPlanned ? "check" : "plus"} size={16} />} onClick={() => onTogglePlan(beer.id)}>
              My route
            </Button>
            {untappd?.rating != null && untappd.url && (
              <Button size="small" variant="contained" color="secondary" component="a" target="_blank" rel="noopener noreferrer" startIcon={<PixelIcon name="external" size={16} />} href={untappd.url}>
                Untappd
              </Button>
            )}
          </Box>
        </DialogContent>
      )}
    </Dialog>
  );
}
