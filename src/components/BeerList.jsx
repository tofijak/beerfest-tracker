import { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { sessionMetaMap } from "../festivals";
import { beerMatchesSession, formatBeerMeta, SESSION_META, untappdSearchUrl } from "../utils";

function SessionChip({ session, festival, size = "small" }) {
  const meta = sessionMetaMap(festival)[session] ?? SESSION_META[session] ?? SESSION_META.all;
  return (
    <Chip
      label={meta.label}
      size={size}
      sx={{
        height: 22,
        fontWeight: 600,
        bgcolor: meta.color,
        color: session === "yellow" ? "#3e2723" : "#fff",
      }}
    />
  );
}

function BeerItem({
  beer,
  brewery,
  festival,
  isDrunk,
  isFavorite,
  rating,
  onToggleDrunk,
  onToggleFavorite,
  onRatingChange,
}) {
  const meta = formatBeerMeta(beer);
  const showSession = Boolean(beer.session && festival?.sessions?.length);

  return (
    <ListItem
      sx={{
        borderLeft: isDrunk ? "4px solid #4caf50" : "none",
        bgcolor: isDrunk ? "rgba(76, 175, 80, 0.05)" : "transparent",
        alignItems: "flex-start",
      }}
    >
      <ListItemIcon sx={{ minWidth: 42, mt: 0.5 }}>
        <Checkbox checked={isDrunk} onChange={() => onToggleDrunk(beer.id)} color="success" />
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: isDrunk ? "line-through" : "none",
                fontWeight: isFavorite ? "bold" : "normal",
              }}
            >
              {beer.name}
            </Typography>
            {showSession ? <SessionChip session={beer.session} festival={festival} /> : null}
            {beer.name !== "TBA" && (
              <IconButton
                href={untappdSearchUrl(beer.name, brewery.name)}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
        secondary={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
            {meta && (
              <Typography variant="body2" color="text.secondary">
                {meta}
              </Typography>
            )}
            {beer.notes && (
              <Typography variant="caption" color="text.secondary">
                {beer.notes}
              </Typography>
            )}
            {isDrunk && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1, mb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: "3rem" }}>
                    Rating:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" sx={{ minWidth: "2.5rem" }}>
                    {rating > 0 ? rating.toFixed(2) : "0.00"}
                  </Typography>
                </Box>
                <Slider
                  value={rating || 0}
                  onChange={(_event, value) => {
                    const next = typeof value === "number" ? Math.round(value * 4) / 4 : 0;
                    onRatingChange(beer.id, next);
                  }}
                  min={0}
                  max={5}
                  step={0.25}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                    { value: 5, label: "5" },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => value.toFixed(2)}
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "100%", sm: "300px" },
                    "& .MuiSlider-thumb": { width: 24, height: 24 },
                    "& .MuiSlider-mark": { display: { xs: "none", sm: "block" } },
                    "& .MuiSlider-markLabel": { fontSize: "0.75rem" },
                  }}
                />
              </Box>
            )}
          </Box>
        }
      />
      <IconButton
        onClick={() => onToggleFavorite(beer.id)}
        color={isFavorite ? "warning" : "default"}
        sx={{ mt: 0.5 }}
      >
        {isFavorite ? <StarIcon /> : <StarBorderIcon />}
      </IconButton>
    </ListItem>
  );
}

const MemoBeerItem = memo(BeerItem);

function BreweryCard({
  brewery,
  festival,
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
  const locationLabel = brewery.stand
    ? `${brewery.location} · stand ${brewery.stand}`
    : brewery.location;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h6" component="h2">
                {brewery.name}
              </Typography>
              {brewery.noLow ? <Chip label="No/Low" size="small" /> : null}
            </Box>
            {locationLabel ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {locationLabel}
                </Typography>
              </Box>
            ) : null}
          </Box>
          <Chip
            label={`${tried}/${beers.length} tried`}
            color={tried === beers.length ? "success" : "default"}
            size="small"
          />
        </Box>
        <Divider sx={{ my: 1 }} />
        <List dense>
          {beers.map((beer) => (
            <MemoBeerItem
              key={beer.id}
              beer={beer}
              brewery={brewery}
              festival={festival}
              isDrunk={drunkBeers.includes(beer.id)}
              isFavorite={favoriteBeers.includes(beer.id)}
              rating={beerRatings[beer.id] || 0}
              onToggleDrunk={onToggleDrunk}
              onToggleFavorite={onToggleFavorite}
              onRatingChange={onRatingChange}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export const MemoBreweryCard = memo(BreweryCard);
