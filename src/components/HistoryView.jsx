import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StarIcon from "@mui/icons-material/Star";
import { FESTIVALS, festivalStats, findBeer, knownBeerIds } from "../festivals";
import { hasFestivalActivity, idsOnMenu, ratedCountFrom, ratingsOnMenu } from "../lib/storage";
import { formatBeerMeta, untappdSearchUrl } from "../utils";

function collectRatedBeers(allProgress) {
  const rated = [];
  for (const festival of FESTIVALS) {
    const progress = allProgress[festival.slug];
    if (!progress) continue;
    for (const [beerId, rating] of Object.entries(progress.beerRatings ?? {})) {
      if (typeof rating !== "number" || rating <= 0) continue;
      const match = findBeer(festival, Number.isNaN(Number(beerId)) ? beerId : Number(beerId));
      if (!match) continue;
      rated.push({
        key: `${festival.slug}:${beerId}`,
        rating,
        festival,
        beer: match.beer,
        brewery: match.brewery,
        favorite: progress.favoriteBeers?.includes(match.beer.id),
      });
    }
  }
  return rated.sort((a, b) => b.rating - a.rating || a.beer.name.localeCompare(b.beer.name));
}

function collectFavorites(allProgress) {
  const favorites = [];
  for (const festival of FESTIVALS) {
    const progress = allProgress[festival.slug];
    for (const beerId of progress?.favoriteBeers ?? []) {
      const match = findBeer(festival, beerId);
      if (!match) continue;
      favorites.push({
        key: `${festival.slug}:${beerId}`,
        rating: progress.beerRatings?.[beerId] || progress.beerRatings?.[String(beerId)] || 0,
        festival,
        beer: match.beer,
        brewery: match.brewery,
      });
    }
  }
  return favorites.sort((a, b) => b.rating - a.rating || a.beer.name.localeCompare(b.beer.name));
}

function BeerRow({ item }) {
  return (
    <ListItem
      secondaryAction={
        item.beer.name !== "TBA" ? (
          <IconButton
            href={untappdSearchUrl(item.beer.name, item.brewery.name)}
            target="_blank"
            rel="noopener noreferrer"
            edge="end"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        ) : null
      }
    >
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", pr: 4 }}>
            <Typography variant="body1" fontWeight={600}>
              {item.beer.name}
            </Typography>
            {item.rating > 0 ? (
              <Chip label={item.rating.toFixed(2)} size="small" color="secondary" />
            ) : null}
            {item.favorite ? <StarIcon fontSize="small" color="warning" /> : null}
          </Box>
        }
        secondary={
          <>
            {item.brewery.name}
            {formatBeerMeta(item.beer) ? ` · ${formatBeerMeta(item.beer)}` : ""}
            {` · ${item.festival.name}${item.festival.edition ? ` ${item.festival.edition}` : ""}`}
          </>
        }
      />
    </ListItem>
  );
}

export function HistoryView({ allProgress, activeSlug, onSelectFestival }) {
  const visited = FESTIVALS.filter((festival) => hasFestivalActivity(allProgress[festival.slug]));
  const topRated = collectRatedBeers(allProgress).slice(0, 20);
  const favorites = collectFavorites(allProgress).slice(0, 20);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your festival passport
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {visited.length === 0
          ? "No stamps yet — check off a beer and this page starts filling in."
          : `${visited.length} festival${visited.length === 1 ? "" : "s"} on your card.`}
      </Typography>

      {FESTIVALS.map((festival) => {
        const stats = festivalStats(festival);
        const progress = allProgress[festival.slug] ?? {};
        const visitedFest = hasFestivalActivity(progress);
        const menuIds = knownBeerIds(festival);
        const rated = ratedCountFrom(ratingsOnMenu(progress.beerRatings, menuIds));
        const tried = idsOnMenu(progress.drunkBeers, menuIds).length;
        const stars = idsOnMenu(progress.favoriteBeers, menuIds).length;

        return (
          <Card key={festival.slug} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="h6">{festival.name}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {festival.venue}
                      {festival.dateLabel || festival.date
                        ? ` · ${festival.dateLabel || festival.date}`
                        : ""}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={visitedFest ? "Been there" : "On the list"}
                  color={visitedFest ? "success" : "default"}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                {stats.beerCount} beers · {stats.breweryCount} breweries
                {visitedFest ? ` · ${rated} rated · ${tried} tried · ${stars} starred` : ""}
              </Typography>
              {festival.slug !== activeSlug ? (
                <Button sx={{ mt: 1.5 }} variant="outlined" onClick={() => onSelectFestival(festival.slug)}>
                  Open this festival
                </Button>
              ) : (
                <Typography variant="caption" color="primary" sx={{ display: "block", mt: 1.5 }}>
                  You are here
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
        All-time hall of foam
      </Typography>
      {topRated.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Rate a pour and it will land here — across every festival you visit.
        </Typography>
      ) : (
        <Card sx={{ mb: 3 }}>
          <List dense>
            {topRated.map((item) => (
              <BeerRow key={item.key} item={item} />
            ))}
          </List>
        </Card>
      )}

      <Typography variant="h6" gutterBottom>
        Starred across fests
      </Typography>
      {favorites.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Star a beer and it stays in your passport.
        </Typography>
      ) : (
        <Card>
          <List dense>
            {favorites.map((item) => (
              <BeerRow key={item.key} item={item} />
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
