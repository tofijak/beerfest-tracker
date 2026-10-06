import { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { breweries } from "../data/beers";
import { UNTAPPD } from "../data/untappd";
import { GRADES, STAND_COLORS, beerGrade, gradeRank } from "../utils";

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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Your must-try beers (favorites + untried beers at or above the grade) ordered by stand.
        Ticking a beer marks it as tried.
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Minimum grade
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
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
      <Typography variant="caption" color="text.secondary">
        Start at stand
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {total} beers across {route.reduce((n, leg) => n + leg.stops.length, 0)} breweries
          </Typography>
          {route.map((leg, index) => (
            <Card key={leg.stand} sx={{ mb: 2, borderLeft: `6px solid ${STAND_COLORS[leg.stand]}` }}>
              <CardContent>
                <Typography variant="h6">
                  {index + 1}. Stand {leg.stand}
                </Typography>
                {leg.stops.map(({ brewery, targets }) => (
                  <Box key={brewery.id} sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">{brewery.name}</Typography>
                    <List dense disablePadding>
                      {targets.map((beer) => {
                        const info = UNTAPPD[beer.id];
                        return (
                          <ListItem key={beer.id} disableGutters>
                            <ListItemIcon sx={{ minWidth: 42 }}>
                              <Checkbox
                                color="success"
                                checked={drunkBeers.includes(beer.id)}
                                onChange={() => onToggleDrunk(beer.id)}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={beer.name}
                              secondary={[
                                beerGrade(beer.id),
                                info?.rating ? `Untappd ${info.rating.toFixed(2)}` : null,
                                beer.session,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Box>
  );
}
