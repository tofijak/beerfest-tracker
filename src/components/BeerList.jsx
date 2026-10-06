import { memo } from "react";
import { Box, Card, CardContent, Checkbox, Chip, IconButton, Slider, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { UNTAPPD } from "../data/untappd";
import {
  SESSION_META,
  STAND_COLORS,
  beerGrade,
  beerMatchesSession,
  formatBeerMeta,
  gradeColor,
  untappdSearchUrl,
} from "../utils";
import { PIXEL_FONT } from "../theme";
import { PixelBar, ScorePlate, pixelCheckboxProps } from "./PixelUI";

function BeerItem({
  beer,
  brewery,
  isDrunk,
  isFavorite,
  rating,
  onToggleDrunk,
  onToggleFavorite,
  onRatingChange,
}) {
  const meta = formatBeerMeta(beer);
  const untappd = UNTAPPD[beer.id];
  const grade = beerGrade(beer.id);
  const session = SESSION_META[beer.session] ?? SESSION_META.all;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "stretch",
        mb: 1.25,
        bgcolor: isDrunk ? "rgba(57,255,136,0.08)" : "rgba(255,255,255,0.03)",
        border: "2px solid",
        borderColor: isDrunk ? "rgba(57,255,136,0.55)" : "rgba(154,164,199,0.2)",
        borderLeft: `8px solid ${session.color}`,
        transition: "background-color 120ms, border-color 120ms",
        "&:hover": { borderColor: "rgba(0,229,255,0.7)" },
      }}
    >
      <Checkbox
        {...pixelCheckboxProps}
        checked={isDrunk}
        onChange={() => onToggleDrunk(beer.id)}
        sx={{ alignSelf: "flex-start", mt: 0.5 }}
        inputProps={{ "aria-label": `Tried ${beer.name}` }}
      />
      <Box sx={{ flex: 1, minWidth: 0, py: 1 }}>
        <Typography
          sx={{
            fontWeight: isFavorite ? 700 : 500,
            textDecoration: isDrunk ? "line-through" : "none",
            opacity: isDrunk ? 0.65 : 1,
            overflowWrap: "anywhere",
          }}
        >
          {beer.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", flexWrap: "wrap", mt: 0.5 }}>
          <Box
            component="span"
            sx={{
              px: 0.75,
              fontFamily: PIXEL_FONT,
              fontSize: "0.62rem",
              textTransform: "uppercase",
              bgcolor: session.color,
              color: beer.session === "yellow" ? "#3e2723" : "#fff",
            }}
          >
            {session.label}
          </Box>
          {meta && (
            <Typography variant="caption" color="text.secondary">
              {meta}
            </Typography>
          )}
        </Box>
        {beer.notes && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            {beer.notes}
          </Typography>
        )}
        {beer.name !== "TBA" && (
          <Chip
            component="a"
            clickable
            href={untappd?.url ?? untappdSearchUrl(beer.name, brewery.name)}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            variant="outlined"
            color="secondary"
            icon={<OpenInNewIcon />}
            label="Untappd"
            sx={{ mt: 0.75, height: 24 }}
          />
        )}
        {isDrunk && (
          <Box sx={{ mt: 1.5, pr: 2 }}>
            <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.75rem", color: "#ffd23f" }}>
              Your rating {rating > 0 ? rating.toFixed(2) : "0.00"}
            </Typography>
            <Slider
              value={rating || 0}
              onChange={(_event, value) => {
                const next = typeof value === "number" ? Math.round(value * 4) / 4 : 0;
                onRatingChange(beer.id, next);
              }}
              min={0}
              max={5}
              step={0.25}
              marks={[0, 1, 2, 3, 4, 5].map((value) => ({ value, label: String(value) }))}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => value.toFixed(2)}
              sx={{
                maxWidth: { xs: "100%", sm: 320 },
                "& .MuiSlider-mark": { display: "none" },
                "& .MuiSlider-markLabel": { fontSize: "0.7rem" },
              }}
            />
          </Box>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1, pr: 0.5, gap: 0.5 }}>
        {beer.name !== "TBA" && (
          <ScorePlate
            grade={grade}
            rating={untappd?.rating ?? null}
            count={untappd?.count ?? null}
            color={gradeColor(grade)}
          />
        )}
        <IconButton
          onClick={() => onToggleFavorite(beer.id)}
          color={isFavorite ? "warning" : "default"}
          aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
        >
          {isFavorite ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}

const MemoBeerItem = memo(BeerItem);

function BreweryCard({
  brewery,
  drunkBeers,
  favoriteBeers,
  beerRatings,
  onToggleDrunk,
  onToggleFavorite,
  onRatingChange,
  showOnlyFavorites = false,
  hideDrunkBeers = false,
  showOnlyUnrated = false,
  sessionFilter = "all",
}) {
  let beers = brewery.beers.filter((beer) => beerMatchesSession(beer, sessionFilter));
  if (showOnlyFavorites) beers = beers.filter((beer) => favoriteBeers.includes(beer.id));
  if (showOnlyUnrated) {
    beers = beers.filter(
      (beer) => drunkBeers.includes(beer.id) && beerRatings[beer.id] === undefined,
    );
  } else if (hideDrunkBeers) {
    beers = beers.filter((beer) => !drunkBeers.includes(beer.id));
  }

  if (beers.length === 0) return null;

  const tried = beers.filter((beer) => drunkBeers.includes(beer.id)).length;
  const color = STAND_COLORS[brewery.stand] ?? "#9aa4c7";

  return (
    <Card sx={{ mb: 3, borderColor: color }}>
      <CardContent>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              flexShrink: 0,
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              bgcolor: color,
              color: "#07070f",
              border: "3px solid #07070f",
              boxShadow: "4px 4px 0 #2a1458",
              fontFamily: PIXEL_FONT,
              fontWeight: 700,
              fontSize: "1.4rem",
            }}
          >
            {brewery.stand || "?"}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h6" component="h2" sx={{ overflowWrap: "anywhere" }}>
                {brewery.name}
              </Typography>
              {brewery.noLow ? <Chip label="No/Low" size="small" /> : null}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {brewery.location} · stand {brewery.stand}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <PixelBar value={tried} total={beers.length} color={color} />
            <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.65rem", mt: 0.5 }}>
              {tried}/{beers.length} tried
            </Typography>
          </Box>
        </Box>
        {beers.map((beer) => (
          <MemoBeerItem
            key={beer.id}
            beer={beer}
            brewery={brewery}
            isDrunk={drunkBeers.includes(beer.id)}
            isFavorite={favoriteBeers.includes(beer.id)}
            rating={beerRatings[beer.id] || 0}
            onToggleDrunk={onToggleDrunk}
            onToggleFavorite={onToggleFavorite}
            onRatingChange={onRatingChange}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export const MemoBreweryCard = memo(BreweryCard);
