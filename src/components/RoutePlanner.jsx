import { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Checkbox, Chip, Typography } from "@mui/material";
import { sessionMeta, standColor, ratingColor, ratingOf } from "../utils";


function sessionOrder(festival) {
  return (festival.sessions ?? []).map((session) => session.id);
}

const MIN_RATINGS = [4.3, 4.2, 4.1, 4.0, 3.8];
import { BODY_FONT, PIXEL_FONT } from "../theme";
import { PixelIconButton } from "./PixelIcons";
import { pixelCheckboxProps } from "./PixelUI";

/**
 * Targets = favorites plus untried beers rated at or above `minRating`.
 * Legs are session colors: the start color first, then the rest by how many targets they hold.
 * Within a leg, breweries are visited stand by stand.
 */
function buildRoute({ festival, drunkBeers, favoriteBeers, minRating, startSession }) {
  const breweries = festival.breweries;
  const legs = sessionOrder(festival).map((session) => ({
    session,
    stops: breweries
      .map((brewery) => ({
        brewery,
        targets: brewery.beers
          .filter((beer) => beer.session === session && !drunkBeers.includes(beer.id))
          .filter(
            (beer) => favoriteBeers.includes(beer.id) || (ratingOf(beer) ?? 0) >= minRating,
          )
          .sort((a, b) => (ratingOf(b) ?? 0) - (ratingOf(a) ?? 0)),
      }))
      .filter(({ targets }) => targets.length > 0)
      .sort((a, b) => a.brewery.stand - b.brewery.stand || a.brewery.name.localeCompare(b.brewery.name)),
  })).filter((leg) => leg.stops.length > 0);

  const size = (leg) => leg.stops.reduce((n, stop) => n + stop.targets.length, 0);
  return legs.sort((a, b) => {
    if (a.session === startSession) return -1;
    if (b.session === startSession) return 1;
    return size(b) - size(a);
  });
}

function AutoRoute({
  festival,
  drunkBeers,
  favoriteBeers,
  minRating,
  startSession,
  onMinRatingChange,
  onStartSessionChange,
  onToggleDrunk,
}) {
  const route = useMemo(
    () => buildRoute({ festival, drunkBeers, favoriteBeers, minRating, startSession }),
    [festival, drunkBeers, favoriteBeers, minRating, startSession],
  );
  const total = route.reduce((n, leg) => n + leg.stops.reduce((m, s) => m + s.targets.length, 0), 0);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Your must-try beers (favorites + untried beers rated at or above the minimum) grouped by session color, stand by stand.
        Ticking a beer marks it as tried.
      </Typography>
      <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.7rem", mb: 1 }}>MIN UNTAPPD RATING</Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {MIN_RATINGS.map((value) => (
          <Chip
            key={value}
            label={`${value.toFixed(1)}+`}
            onClick={() => onMinRatingChange(value)}
            color={value === minRating ? "primary" : "default"}
            variant={value === minRating ? "filled" : "outlined"}
          />
        ))}
      </Box>
      <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.7rem", mb: 1 }}>START WITH</Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        {sessionOrder(festival).map((session) => (
          <Chip
            key={session}
            label={sessionMeta(festival, session).label}
            onClick={() => onStartSessionChange(session)}
            variant={session === startSession ? "filled" : "outlined"}
            sx={
              session === startSession
                ? { bgcolor: `${sessionMeta(festival, session).color} !important`, color: "#07070f !important" }
                : { color: sessionMeta(festival, session).color, borderColor: `${sessionMeta(festival, session).color} !important` }
            }
          />
        ))}
      </Box>
      {route.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Nothing left on the route — lower the minimum rating or star more beers.
        </Typography>
      ) : (
        <>
          <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.8rem", mb: 2, color: "#ffd23f" }}>
            {total} beers · {route.reduce((n, leg) => n + leg.stops.length, 0)} breweries
          </Typography>
          {route.map((leg, index) => {
            const color = sessionMeta(festival, leg.session).color;
            return (
              <Box key={leg.session} sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: color,
                      color: "#07070f",
                      border: "3px solid #07070f",
                      boxShadow: "4px 4px 0 #2a1458",
                      fontFamily: BODY_FONT,
                      fontWeight: 700,
                      fontSize: "1.45rem",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {index + 1}
                  </Box>
                  {index < route.length - 1 && (
                    <Box
                      sx={{
                        flex: 1,
                        width: 0,
                        my: 0.5,
                        borderLeft: `4px dotted ${color}`,
                      }}
                    />
                  )}
                </Box>
                <Card sx={{ flex: 1, mb: 3, borderColor: color }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color }}>
                      {sessionMeta(festival, leg.session).label} session
                    </Typography>
                    {leg.stops.map(({ brewery, targets }) => (
                      <Box key={brewery.id} sx={{ mt: 1.5 }}>
                        <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.8rem" }}>
                          {brewery.name}{" "}
                          <Box component="span" sx={{ color: standColor(brewery.stand) }}>
                            · stand {brewery.stand}
                          </Box>
                        </Typography>
                        {targets.map((beer) => {
                                                    const rating = ratingOf(beer);
                          return (
                            <Box
                              key={beer.id}
                              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
                            >
                              <Checkbox
                                {...pixelCheckboxProps}
                                checked={drunkBeers.includes(beer.id)}
                                onChange={() => onToggleDrunk(beer.id)}
                                inputProps={{ "aria-label": `Tried ${beer.name}` }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                                  {beer.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {beer.style}
                                  {typeof beer.abv === "number" ? ` · ${beer.abv}% ABV` : ""}
                                </Typography>
                              </Box>
                              {rating != null && (
                                <Box
                                  sx={{
                                    px: 1,
                                    fontFamily: PIXEL_FONT,
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    fontVariantNumeric: "tabular-nums",
                                    bgcolor: ratingColor(rating),
                                    color: "#07070f",
                                  }}
                                >
                                  {rating.toFixed(2)}
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </>
      )}
    </Box>
  );
}

/** User-built route: beers added via the list icon, freely reordered. */
function MyRoute({ festival, plannedBeers, onPlannedChange, favoriteBeers, drunkBeers, onToggleDrunk }) {
  const [copied, setCopied] = useState(false);
  const lookup = useMemo(
    () =>
      new Map(
        festival.breweries.flatMap((brewery) => brewery.beers.map((beer) => [beer.id, { beer, brewery }])),
      ),
    [festival],
  );
  const order = sessionOrder(festival);
  const items = plannedBeers.map((id) => lookup.get(id)).filter(Boolean);

  const move = (index, delta) => {
    const next = [...plannedBeers];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onPlannedChange(next);
  };
  const remove = (id) => onPlannedChange(plannedBeers.filter((value) => value !== id));
  const sortBySession = () =>
    onPlannedChange(
      [...items]
        .sort(
          (a, b) =>
            order.indexOf(a.beer.session) - order.indexOf(b.beer.session) ||
            a.brewery.stand - b.brewery.stand ||
            a.brewery.name.localeCompare(b.brewery.name),
        )
        .map(({ beer }) => beer.id),
    );
  const sortByStand = () =>
    onPlannedChange(
      [...items]
        .sort((a, b) => a.brewery.stand - b.brewery.stand || a.brewery.name.localeCompare(b.brewery.name))
        .map(({ beer }) => beer.id),
    );
  const addFavorites = () =>
    onPlannedChange([...plannedBeers, ...favoriteBeers.filter((id) => !plannedBeers.includes(id))]);
  const copy = async () => {
    const text = items
      .map(({ beer, brewery }, i) => `${i + 1}. [Stand ${brewery.stand}] ${brewery.name} – ${beer.name}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Build your own route: tap the list-add icon on any beer, then reorder it here.
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
        <Button size="small" variant="contained" onClick={sortBySession} disabled={items.length < 2}>
          Sort by color
        </Button>
        <Button size="small" variant="contained" onClick={sortByStand} disabled={items.length < 2}>
          Sort by stand
        </Button>
        <Button size="small" variant="contained" color="secondary" onClick={addFavorites}>
          Add favorites
        </Button>
        <Button size="small" variant="contained" color="success" onClick={copy} disabled={!items.length}>
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button size="small" variant="outlined" onClick={() => onPlannedChange([])} disabled={!items.length}>
          Clear
        </Button>
      </Box>
      {items.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Your route is empty. Add beers from the All Beers tab.
        </Typography>
      ) : (
        items.map(({ beer, brewery }, index) => {
          const color = sessionMeta(festival, beer.session).color;
          const rating = ratingOf(beer);
          return (
            <Box
              key={beer.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
                mb: 1.25,
                bgcolor: "rgba(255,255,255,0.03)",
                border: "2px solid rgba(154,164,199,0.2)",
                borderLeft: `8px solid ${color}`,
                p: 0.5,
              }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: color,
                  color: "#07070f",
                  fontFamily: BODY_FONT,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {index + 1}
              </Box>
              <Checkbox
                {...pixelCheckboxProps}
                checked={drunkBeers.includes(beer.id)}
                onChange={() => onToggleDrunk(beer.id)}
                sx={{ p: 0.5 }}
                inputProps={{ "aria-label": `Tried ${beer.name}` }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    overflowWrap: "anywhere",
                    textDecoration: drunkBeers.includes(beer.id) ? "line-through" : "none",
                  }}
                >
                  {beer.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {brewery.name} · stand {brewery.stand} · {sessionMeta(festival, beer.session).label}
                </Typography>
              </Box>
              {rating != null && (
                <Box
                  sx={{
                    px: 0.75,
                    fontFamily: PIXEL_FONT,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    fontVariantNumeric: "tabular-nums",
                    bgcolor: ratingColor(rating),
                    color: "#07070f",
                  }}
                >
                  {rating.toFixed(2)}
                </Box>
              )}
              <Box sx={{ display: "flex", flexShrink: 0, gap: 0.5 }}>
                <PixelIconButton icon="up" label="Move up" size={30} iconSize={16} disabled={index === 0} onClick={() => move(index, -1)} />
                <PixelIconButton icon="down" label="Move down" size={30} iconSize={16} disabled={index === items.length - 1} onClick={() => move(index, 1)} />
                <PixelIconButton icon="trash" label="Remove" size={30} iconSize={16} color="#ff5252" onClick={() => remove(beer.id)} />
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
}

export function RoutePlanner({ festival, plannedBeers, onPlannedChange, ...autoProps }) {
  const [mode, setMode] = useState("mine");
  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <Chip
          label="My route"
          onClick={() => setMode("mine")}
          color={mode === "mine" ? "primary" : "default"}
          variant={mode === "mine" ? "filled" : "outlined"}
        />
        <Chip
          label="Suggested"
          onClick={() => setMode("auto")}
          color={mode === "auto" ? "primary" : "default"}
          variant={mode === "auto" ? "filled" : "outlined"}
        />
      </Box>
      {mode === "mine" ? (
        <MyRoute
          festival={festival}
          plannedBeers={plannedBeers}
          onPlannedChange={onPlannedChange}
          favoriteBeers={autoProps.favoriteBeers}
          drunkBeers={autoProps.drunkBeers}
          onToggleDrunk={autoProps.onToggleDrunk}
        />
      ) : (
        <AutoRoute festival={festival} {...autoProps} />
      )}
    </Box>
  );
}
