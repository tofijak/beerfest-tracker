import { useMemo, useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { festivalStandDefs, standColor, standMeta, ratingColor, ratingOf } from "../utils";
import { PIXEL_FONT } from "../theme";
import { PixelBar } from "./PixelUI";

function zoneStats(breweries, stand, drunkBeers) {
  const list = breweries
    .filter((brewery) => brewery.stand === stand)
    .sort((a, b) => (a.table ?? 0) - (b.table ?? 0) || a.name.localeCompare(b.name));
  const beers = list.flatMap((brewery) => brewery.beers);
  return {
    breweries: list,
    total: beers.length,
    tried: beers.filter((beer) => drunkBeers.includes(beer.id)).length,
    top: beers.filter((beer) => (ratingOf(beer) ?? 0) >= 4.2).length,
  };
}

/** One isometric voxel tower: stacked CSS 3D slabs, taller = more beers. */
function Tower({ stand, label, total, active, onSelect }) {
  const color = standColor(stand);
  const layers = 6 + Math.round(total / 6);
  return (
    <Box
      component="button"
      onClick={onSelect}
      aria-label={label}
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
              fontSize: String(label).length > 1 ? { xs: "1.15rem", sm: "1.45rem" } : "2.6rem",
              color: "#07070f",
            }}
          >
            {top ? label : null}
          </Box>
        );
      })}
    </Box>
  );
}

export function VenueMap({ festival, drunkBeers }) {
  const STANDS = useMemo(() => festivalStandDefs(festival).map((item) => item.id), [festival]);
  const [selected, setSelected] = useState(STANDS[0] ?? 1);
  const current = STANDS.includes(selected) ? selected : (STANDS[0] ?? 1);
  const stats = useMemo(
    () => Object.fromEntries(STANDS.map((stand) => [stand, zoneStats(festival.breweries, stand, drunkBeers)])),
    [STANDS, festival, drunkBeers],
  );
  const active = stats[current];
  const color = standColor(current);
  const selectedMeta = standMeta(festival, current);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Schematic of the stand areas at {festival.venue} — tower height is beer count. Tap a tower.
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
              label={standMeta(festival, stand).short ?? standMeta(festival, stand).name}
              total={stats[stand].total}
              active={stand === current}
              onSelect={() => setSelected(stand)}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(STANDS.length, 1)}, 1fr)`, gap: { xs: 1, sm: 1.5 }, mb: 3 }}>
        {STANDS.map((stand) => {
          const { tried, total, top, breweries } = stats[stand];
          const meta = standMeta(festival, stand);
          return (
            <Card
              key={stand}
              onClick={() => setSelected(stand)}
              sx={{
                cursor: "pointer",
                borderColor: standColor(stand),
                opacity: stand === current ? 1 : 0.6,
              }}
            >
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="h6" sx={{ color: standColor(stand), fontSize: { xs: "0.85rem", sm: "1.25rem" } }}>
                  {meta.name}
                </Typography>
                {meta.tables ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Tables {meta.tables} · {breweries.length} breweries
                  </Typography>
                ) : null}
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
            {selectedMeta.name}
            {selectedMeta.tables ? ` · tables ${selectedMeta.tables}` : ""} · {active.breweries.length} breweries
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
                  {brewery.table ? `Table ${brewery.table} · ` : ""}
                  {brewery.name} · {brewery.location}
                </Typography>
                {best && (
                  <Box
                    sx={{
                      px: 1,
                      fontFamily: PIXEL_FONT,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      fontVariantNumeric: "tabular-nums",
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
