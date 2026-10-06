import { useMemo, useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { standColor, ratingColor, ratingOf } from "../utils";
import { PIXEL_FONT } from "../theme";
import { PixelBar } from "./PixelUI";

function zoneStats(breweries, stand, drunkBeers) {
  const list = breweries.filter((brewery) => brewery.stand === stand);
  const beers = list.flatMap((brewery) => brewery.beers);
  return {
    breweries: list,
    total: beers.length,
    tried: beers.filter((beer) => drunkBeers.includes(beer.id)).length,
    top: beers.filter((beer) => (ratingOf(beer) ?? 0) >= 4.2).length,
  };
}

/** One isometric voxel tower: stacked CSS 3D slabs, taller = more beers. */
function Tower({ stand, total, active, onSelect }) {
  const color = standColor(stand);
  const layers = 6 + Math.round(total / 6);
  return (
    <Box
      component="button"
      onClick={onSelect}
      aria-label={`Stand ${stand}`}
      sx={{
        all: "unset",
        cursor: "pointer",
        width: { xs: 72, sm: 104 },
        height: { xs: 72, sm: 104 },
        position: "relative",
        transformStyle: "preserve-3d",
        transition: "transform 160ms",
        transform: active ? "translateZ(18px)" : "none",
        "&:hover": { transform: "translateZ(10px)" },
        "&:focus-visible": { outline: "3px solid #ffd23f" },
      }}
    >
      {Array.from({ length: layers }, (_, index) => {
        const top = index === layers - 1;
        return (
          <Box
            key={index}
            sx={{
              position: "absolute",
              inset: 0,
              transform: `translateZ(${index * 3}px)`,
              bgcolor: color,
              filter: top ? "none" : `brightness(${0.35 + (index / layers) * 0.4})`,
              border: "3px solid #07070f",
              display: "grid",
              placeItems: "center",
              fontFamily: PIXEL_FONT,
              fontWeight: 700,
              fontSize: "2.6rem",
              color: "#07070f",
            }}
          >
            {top ? stand : null}
          </Box>
        );
      })}
    </Box>
  );
}

export function VenueMap({ festival, drunkBeers }) {
  const STANDS = useMemo(
    () => [...new Set(festival.breweries.map((brewery) => brewery.stand).filter(Boolean))].sort((a, b) => a - b),
    [festival],
  );
  const [selected, setSelected] = useState(STANDS[0] ?? 1);
  const stats = useMemo(
    () => Object.fromEntries(STANDS.map((stand) => [stand, zoneStats(festival.breweries, stand, drunkBeers)])),
    [STANDS, festival, drunkBeers],
  );
  const active = stats[selected];
  const color = standColor(selected);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Schematic of the three stand areas at Ridehuset — tower height is beer count. Tap a tower.
      </Typography>
      <Box sx={{ height: { xs: 200, sm: 280 }, display: "grid", placeItems: "center", perspective: 900, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 3, sm: 4 },
            transformStyle: "preserve-3d",
            transform: "rotateX(58deg) rotateZ(-38deg)",
          }}
        >
          {STANDS.map((stand) => (
            <Tower
              key={stand}
              stand={stand}
              total={stats[stand].total}
              active={stand === selected}
              onSelect={() => setSelected(stand)}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(STANDS.length, 1)}, 1fr)`, gap: { xs: 1, sm: 1.5 }, mb: 3 }}>
        {STANDS.map((stand) => {
          const { tried, total, top } = stats[stand];
          return (
            <Card
              key={stand}
              onClick={() => setSelected(stand)}
              sx={{
                cursor: "pointer",
                borderColor: standColor(stand),
                opacity: stand === selected ? 1 : 0.6,
              }}
            >
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="h6" sx={{ color: standColor(stand), fontSize: { xs: "0.85rem", sm: "1.25rem" } }}>
                  Stand {stand}
                </Typography>
                <PixelBar value={tried} total={total} color={standColor(stand)} />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {tried}/{total} tried · {top} 4.2+
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>
      <Card sx={{ borderColor: color }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color }}>
            Stand {selected} · {active.breweries.length} breweries
          </Typography>
          {active.breweries.map((brewery) => {
            const best = brewery.beers
              .map((beer) => ratingOf(beer))
              .filter((value) => value != null)
              .sort((a, b) => b - a)[0];
            return (
              <Box
                key={brewery.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 0.75,
                  borderBottom: "2px dashed rgba(154,164,199,0.2)",
                }}
              >
                <Typography variant="body2">
                  {brewery.name} · {brewery.location}
                </Typography>
                {best && (
                  <Box
                    sx={{
                      px: 1,
                      fontFamily: PIXEL_FONT,
                      fontSize: "0.7rem",
                      bgcolor: ratingColor(best),
                      color: "#07070f",
                    }}
                  >
                    {best.toFixed(2)}
                  </Box>
                )}
              </Box>
            );
          })}
        </CardContent>
      </Card>
    </Box>
  );
}
