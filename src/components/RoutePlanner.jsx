import { useMemo } from "react";
import { Box, Card, CardContent, Checkbox, Chip, Typography } from "@mui/material";
import { breweries } from "../data/beers";
import { UNTAPPD } from "../data/untappd";
import { GRADES, STAND_COLORS, beerGrade, gradeColor, gradeRank } from "../utils";
import { PIXEL_FONT } from "../theme";
import { pixelCheckboxProps } from "./PixelUI";

/**
 * Targets = favorites plus untried beers graded at or above `minGrade`.
 * Stands are visited start-first, then by how many targets they hold; within a stand,
 * breweries are ordered by their best target.
 */
function buildRoute({ drunkBeers, favoriteBeers, minGrade, startStand }) {
  const cutoff = gradeRank(minGrade);
  const stops = breweries
    .map((brewery) => ({
      brewery,
      targets: brewery.beers
        .filter((beer) => !drunkBeers.includes(beer.id))
        .filter(
          (beer) =>
            favoriteBeers.includes(beer.id) || gradeRank(beerGrade(beer.id)) <= cutoff,
        )
        .sort((a, b) => gradeRank(beerGrade(a.id)) - gradeRank(beerGrade(b.id))),
    }))
    .filter(({ targets }) => targets.length > 0);

  const best = (stop) => gradeRank(beerGrade(stop.targets[0].id));
  const standCount = (stand) =>
    stops.filter((stop) => stop.brewery.stand === stand).reduce((n, s) => n + s.targets.length, 0);
  const order = [1, 2, 3]
    .filter((stand) => stand !== startStand)
    .sort((a, b) => standCount(b) - standCount(a));
  order.unshift(startStand);

  return order
    .map((stand) => ({
      stand,
      stops: stops
        .filter((stop) => stop.brewery.stand === stand)
        .sort((a, b) => best(a) - best(b) || a.brewery.name.localeCompare(b.brewery.name)),
    }))
    .filter((leg) => leg.stops.length > 0);
}

export function RoutePlanner({
  drunkBeers,
  favoriteBeers,
  minGrade,
  startStand,
  onMinGradeChange,
  onStartStandChange,
  onToggleDrunk,
}) {
  const route = useMemo(
    () => buildRoute({ drunkBeers, favoriteBeers, minGrade, startStand }),
    [drunkBeers, favoriteBeers, minGrade, startStand],
  );
  const total = route.reduce((n, leg) => n + leg.stops.reduce((m, s) => m + s.targets.length, 0), 0);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Your must-try beers (favorites + untried beers at or above the grade) ordered by stand.
        Ticking a beer marks it as tried.
      </Typography>
      <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.7rem", mb: 1 }}>MIN GRADE</Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {GRADES.slice(0, 5).map((grade) => (
          <Chip
            key={grade}
            label={grade}
            onClick={() => onMinGradeChange(grade)}
            color={grade === minGrade ? "primary" : "default"}
            variant={grade === minGrade ? "filled" : "outlined"}
          />
        ))}
      </Box>
      <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.7rem", mb: 1 }}>START AT</Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        {[1, 2, 3].map((stand) => (
          <Chip
            key={stand}
            label={`Stand ${stand}`}
            onClick={() => onStartStandChange(stand)}
            color={stand === startStand ? "primary" : "default"}
            variant={stand === startStand ? "filled" : "outlined"}
          />
        ))}
      </Box>
      {route.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Nothing left on the route — lower the minimum grade or star more beers.
        </Typography>
      ) : (
        <>
          <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.8rem", mb: 2, color: "#ffd23f" }}>
            {total} beers · {route.reduce((n, leg) => n + leg.stops.length, 0)} breweries
          </Typography>
          {route.map((leg, index) => {
            const color = STAND_COLORS[leg.stand];
            return (
              <Box key={leg.stand} sx={{ display: "flex", gap: 2 }}>
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
                      fontFamily: PIXEL_FONT,
                      fontWeight: 700,
                      fontSize: "1.2rem",
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
                      Stand {leg.stand}
                    </Typography>
                    {leg.stops.map(({ brewery, targets }) => (
                      <Box key={brewery.id} sx={{ mt: 1.5 }}>
                        <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.8rem" }}>
                          {brewery.name}
                        </Typography>
                        {targets.map((beer) => {
                          const info = UNTAPPD[beer.id];
                          const grade = beerGrade(beer.id);
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
                                  {beer.session}
                                  {info?.rating != null ? ` · Untappd ${info.rating.toFixed(2)}` : ""}
                                </Typography>
                              </Box>
                              {grade && (
                                <Box
                                  sx={{
                                    px: 1,
                                    fontFamily: PIXEL_FONT,
                                    fontSize: "0.75rem",
                                    bgcolor: gradeColor(grade),
                                    color: "#07070f",
                                  }}
                                >
                                  {grade}
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
