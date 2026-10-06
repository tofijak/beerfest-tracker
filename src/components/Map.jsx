import { useMemo, useState } from "react";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { breweries } from "../data/beers";
import { STAND_COLORS, beerGrade, gradeRank } from "../utils";

/** Schematic zone layout of the three stand areas (not a surveyed floor plan). */
const ZONES = [
  { stand: 1, x: 10, y: 20, w: 120, h: 160 },
  { stand: 2, x: 140, y: 20, w: 120, h: 160 },
  { stand: 3, x: 270, y: 20, w: 120, h: 160 },
];

function zoneStats(stand, drunkBeers) {
  const list = breweries.filter((brewery) => brewery.stand === stand);
  const beers = list.flatMap((brewery) => brewery.beers);
  return {
    breweries: list,
    total: beers.length,
    tried: beers.filter((beer) => drunkBeers.includes(beer.id)).length,
    top: beers.filter((beer) => beerGrade(beer.id)?.startsWith("A")).length,
  };
}

export function VenueMap({ drunkBeers }) {
  const [selected, setSelected] = useState(1);
  const stats = useMemo(
    () => Object.fromEntries(ZONES.map(({ stand }) => [stand, zoneStats(stand, drunkBeers)])),
    [drunkBeers],
  );
  const active = stats[selected];

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Schematic of the three stand areas at Ridehuset. Tap a zone to see its breweries.
      </Typography>
      <Box component="svg" viewBox="0 0 400 200" sx={{ width: "100%", height: "auto", mb: 2 }}>
        <rect x="2" y="2" width="396" height="196" rx="10" fill="none" stroke="#9e9e9e" />
        <text x="200" y="14" textAnchor="middle" fontSize="9" fill="#757575">
          Ridehuset
        </text>
        {ZONES.map(({ stand, x, y, w, h }) => {
          const { tried, total, top } = stats[stand];
          const isActive = stand === selected;
          return (
            <g
              key={stand}
              onClick={() => setSelected(stand)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={`Stand ${stand}`}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx="8"
                fill={STAND_COLORS[stand]}
                fillOpacity={isActive ? 0.9 : 0.35}
                stroke={STAND_COLORS[stand]}
                strokeWidth={isActive ? 3 : 1}
              />
              <text x={x + w / 2} y={y + 55} textAnchor="middle" fontSize="38" fontWeight="700" fill="#fff">
                {stand}
              </text>
              <text x={x + w / 2} y={y + 85} textAnchor="middle" fontSize="11" fill="#fff">
                {stats[stand].breweries.length} breweries
              </text>
              <text x={x + w / 2} y={y + 105} textAnchor="middle" fontSize="11" fill="#fff">
                {tried}/{total} tried
              </text>
              <text x={x + w / 2} y={y + 125} textAnchor="middle" fontSize="11" fill="#fff">
                {top} A-grade
              </text>
            </g>
          );
        })}
      </Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Stand {selected}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {active.breweries.map((brewery) => {
              const best = brewery.beers
                .map((beer) => beerGrade(beer.id))
                .filter(Boolean)
                .sort((a, b) => gradeRank(a) - gradeRank(b))[0];
              return (
                <Box
                  key={brewery.id}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="body2">
                    {brewery.name} · {brewery.location}
                  </Typography>
                  {best && <Chip size="small" label={`best ${best}`} />}
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
