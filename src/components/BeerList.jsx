import { memo } from "react";
import { Box, Card, CardContent, Checkbox, Chip, Slider, Typography } from "@mui/material";
import {
  sessionMeta,
  standColor,
  formatBeerMeta,
  styleCategory,
  ratingColor,
} from "../utils";
import { BODY_FONT, PIXEL_FONT } from "../theme";
import { PixelIcon, PixelIconButton } from "./PixelIcons";
import { PixelBar, ScorePlate, StandBadge, StyleBadge, pixelCheckboxProps } from "./PixelUI";

function BeerItem({
  festival,
  beer,
  brewery,
  isDrunk,
  isFavorite,
  isPlanned,
  showBrewery = false,
  rating,
  onToggleDrunk,
  onToggleFavorite,
  onTogglePlan,
  onRatingChange,
  onOpen,
}) {
  const meta = formatBeerMeta(beer);
  const untappd = beer.untappd;
  const session = sessionMeta(festival, beer.session);

  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: 0.25, sm: 1 },
        alignItems: "stretch",
        mb: 1.25,
        bgcolor: isDrunk ? "rgba(57,255,136,0.08)" : "rgba(255,255,255,0.03)",
        border: "2px solid",
        borderColor: isDrunk ? "rgba(57,255,136,0.55)" : "rgba(154,164,199,0.2)",
        borderLeft: { xs: `6px solid ${session.color}`, sm: `8px solid ${session.color}` },
        transition: "background-color 120ms, border-color 120ms",
        "&:hover": { borderColor: "rgba(0,229,255,0.7)" },
      }}
    >
      <Checkbox
        {...pixelCheckboxProps}
        checked={isDrunk}
        onChange={() => onToggleDrunk(beer.id)}
        sx={{ alignSelf: "flex-start", mt: 0.5, p: { xs: 0.5, sm: 1 } }}
        inputProps={{ "aria-label": `Tried ${beer.name}` }}
      />
      <Box sx={{ flex: 1, minWidth: 0, py: 1 }}>
        <Typography
          component="button"
          onClick={() => onOpen(beer.id)}
          sx={{
            all: "unset",
            cursor: "pointer",
            display: "block",
            "&:hover": { color: "#00e5ff" },
            "&:focus-visible": { outline: "2px solid #ffd23f" },
            fontWeight: isFavorite ? 700 : 500,
            textDecoration: isDrunk ? "line-through" : "none",
            opacity: isDrunk ? 0.65 : 1,
            overflowWrap: "anywhere",
          }}
        >
          {beer.name}
        </Typography>
        {showBrewery && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {brewery.name}{brewery.stand ? ` · stand ${brewery.stand}` : ""}
          </Typography>
        )}
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
          <StandBadge stand={brewery.stand} />
          <StyleBadge category={styleCategory(beer)} />
          {meta && (
            <Typography variant="caption" color="text.secondary">
              {meta}
            </Typography>
          )}
        </Box>
        {beer.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", mt: 0.25 }}
          >
            {beer.description.text}
          </Typography>
        )}
        {beer.notes && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            {beer.notes}
          </Typography>
        )}
        {untappd?.rating != null && untappd.url && (
          <Chip
            component="a"
            clickable
            href={untappd.url}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            variant="outlined"
            color="secondary"
            icon={<PixelIcon name="external" size={14} />}
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
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1, pr: 0.5, gap: 0.5, flexShrink: 0 }}>
        {beer.name !== "TBA" && (
          <ScorePlate
            rating={untappd?.rating ?? null}
            count={untappd?.count ?? null}
            color={ratingColor(untappd?.rating ?? null)}
          />
        )}
        <Box sx={{ display: "flex", flexDirection: { xs: "row", sm: "column" }, gap: 0.75 }}>
          <PixelIconButton
            icon="star"
            label={isFavorite ? "Remove favorite" : "Add favorite"}
            active={isFavorite}
            color="#ffd23f"
            size={34}
            iconSize={18}
            onClick={() => onToggleFavorite(beer.id)}
          />
          <PixelIconButton
            icon={isPlanned ? "check" : "plus"}
            label={isPlanned ? "Remove from my route" : "Add to my route"}
            active={isPlanned}
            color="#39ff88"
            size={34}
            iconSize={18}
            onClick={() => onTogglePlan(beer.id)}
          />
        </Box>
      </Box>
    </Box>
  );
}

export const MemoBeerItem = memo(BeerItem);

function BreweryCard({
  festival,
  brewery,
  beers,
  drunkBeers,
  favoriteBeers,
  plannedBeers,
  beerRatings,
  onToggleDrunk,
  onToggleFavorite,
  onTogglePlan,
  onRatingChange,
  onOpen,
}) {
  const tried = beers.filter((beer) => drunkBeers.includes(beer.id)).length;
  const color = standColor(brewery.stand);

  return (
    <Card sx={{ mb: 3, borderColor: color }}>
      <CardContent sx={{ px: { xs: 1.25, sm: 2 } }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
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
              fontFamily: BODY_FONT,
              fontSize: "2rem",
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
              {[brewery.location, brewery.stand ? `stand ${brewery.stand}` : null].filter(Boolean).join(" · ")}
            </Typography>
          </Box>
          <Box sx={{ textAlign: { xs: "left", sm: "right" }, width: { xs: "100%", sm: "auto" } }}>
            <PixelBar value={tried} total={beers.length} color={color} />
            <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.65rem", mt: 0.5 }}>
              {tried}/{beers.length} tried
            </Typography>
          </Box>
        </Box>
        {beers.map((beer) => (
          <MemoBeerItem
            key={beer.id}
            festival={festival}
            beer={beer}
            brewery={brewery}
            isDrunk={drunkBeers.includes(beer.id)}
            isFavorite={favoriteBeers.includes(beer.id)}
            isPlanned={plannedBeers.includes(beer.id)}
            rating={beerRatings[beer.id] || 0}
            onToggleDrunk={onToggleDrunk}
            onToggleFavorite={onToggleFavorite}
            onTogglePlan={onTogglePlan}
            onRatingChange={onRatingChange}
            onOpen={onOpen}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export const MemoBreweryCard = memo(BreweryCard);
