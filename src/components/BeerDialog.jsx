import { Box, Button, Checkbox, Chip, Dialog, DialogContent, FormControlLabel, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import { UNTAPPD } from "../data/untappd";
import { DESCRIPTIONS } from "../data/descriptions";
import { SESSION_META, STAND_COLORS, ratingColor, styleCategory } from "../utils";
import { BODY_FONT } from "../theme";
import { pixelCheckboxProps } from "./PixelUI";

function Stat({ label, value, color }) {
  return (
    <Box sx={{ flex: 1, minWidth: 90, p: 1.5, border: "3px solid #07070f", bgcolor: color ?? "#241a4d", color: color ? "#07070f" : "#eef1ff", boxShadow: "3px 3px 0 #2a1458" }}>
      <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: "1.4rem", lineHeight: 1.1 }}>{value}</Typography>
      <Typography sx={{ fontSize: "0.65rem", textTransform: "uppercase", opacity: 0.8 }}>{label}</Typography>
    </Box>
  );
}

export function BeerDialog({ entry, drunkBeers, favoriteBeers, plannedBeers, onToggleDrunk, onToggleFavorite, onTogglePlan, onClose }) {
  const { beer, brewery } = entry ?? {};
  const open = Boolean(entry);
  const untappd = beer ? UNTAPPD[beer.id] : null;
  const session = beer ? (SESSION_META[beer.session] ?? SESSION_META.all) : null;
  const description = beer ? DESCRIPTIONS[beer.id] : null;
  const isFavorite = beer && favoriteBeers.includes(beer.id);
  const isPlanned = beer && plannedBeers.includes(beer.id);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper"
      PaperProps={{ sx: { m: { xs: 1.5, sm: 4 }, border: `3px solid ${beer ? STAND_COLORS[brewery.stand] : "#00e5ff"}`, boxShadow: "6px 6px 0 #2a1458", backgroundImage: "linear-gradient(160deg,#0b1a2e,#1d0f3a)" } }}>
      {beer && (
        <DialogContent sx={{ position: "relative" }}>
          <IconButton onClick={onClose} aria-label="Close" sx={{ position: "absolute", top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="overline" sx={{ color: STAND_COLORS[brewery.stand] }}>
            {brewery.name} · {brewery.location} · stand {brewery.stand}
          </Typography>
          <Typography variant="h5" sx={{ pr: 5, mb: 1.5, overflowWrap: "anywhere", fontSize: { xs: "1.1rem", sm: "1.5rem" } }}>
            {beer.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip size="small" label={session.label} sx={{ bgcolor: session.color, color: beer.session === "yellow" ? "#3e2723" : "#fff" }} />
            <Chip size="small" variant="outlined" label={styleCategory(beer)} />
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
            <Stat label={untappd?.count != null ? `Untappd · ${untappd.count} ratings` : "Untappd"} value={untappd?.rating != null ? untappd.rating.toFixed(2) : "n/a"} color={untappd?.rating != null ? ratingColor(untappd.rating) : undefined} />
            <Stat label="ABV" value={typeof beer.abv === "number" ? `${beer.abv}%` : "n/a"} />
          </Box>
          {description && (
            <Typography variant="body2" sx={{ mb: 1, p: 1.5, bgcolor: "rgba(0,229,255,0.08)", borderLeft: "4px solid #00e5ff" }}>
              {description.text}
              {description.source && (
                <Box component="a" href={description.source} target="_blank" rel="noopener noreferrer" sx={{ display: "block", mt: 0.5, fontSize: "0.7rem", color: "#9aa4c7" }}>
                  source
                </Box>
              )}
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
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 2 }}>
            <FormControlLabel control={<Checkbox {...pixelCheckboxProps} checked={drunkBeers.includes(beer.id)} onChange={() => onToggleDrunk(beer.id)} />} label="Tried" />
            <Button size="small" variant="contained" color={isFavorite ? "warning" : "primary"} startIcon={isFavorite ? <StarIcon /> : <StarBorderIcon />} onClick={() => onToggleFavorite(beer.id)}>
              Favorite
            </Button>
            <Button size="small" variant="contained" color={isPlanned ? "success" : "primary"} startIcon={isPlanned ? <PlaylistAddCheckIcon /> : <PlaylistAddIcon />} onClick={() => onTogglePlan(beer.id)}>
              My route
            </Button>
            {untappd?.rating != null && untappd.url && (
              <Button size="small" variant="contained" color="secondary" component="a" target="_blank" rel="noopener noreferrer" startIcon={<OpenInNewIcon />} href={untappd.url}>
                Untappd
              </Button>
            )}
          </Box>
        </DialogContent>
      )}
    </Dialog>
  );
}
