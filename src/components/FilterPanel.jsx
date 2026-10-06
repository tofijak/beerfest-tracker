import { useState } from "react";
import { Badge, Box, Button, Chip, Collapse, Slider, Typography } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import { ABV_MAX, DEFAULT_FILTERS, RATING_MAX, RATING_MIN, activeFilterCount } from "../filters";
import { breweries } from "../data/beers";
import { STAND_COLORS, STYLE_CATEGORIES, STYLE_META, styleCategory } from "../utils";

const STYLE_COUNTS = breweries
  .flatMap((brewery) => brewery.beers)
  .reduce((acc, beer) => {
    const category = styleCategory(beer);
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
import { PIXEL_FONT } from "../theme";

const STATUS = [
  ["all", "All"],
  ["untried", "Untried"],
  ["tried", "Tried"],
  ["unrated", "Tried, unrated"],
  ["favorites", "Favorites"],
  ["planned", "In my route"],
];
const SESSIONS = [
  ["green", "Green"],
  ["yellow", "Yellow"],
  ["red", "Red"],
  ["nolo", "No/Low"],
];
const SORTS = [
  ["default", "By brewery"],
  ["rating", "Rating"],
  ["abv", "ABV"],
  ["name", "Name"],
];

function Label({ children }) {
  return (
    <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.7rem", mb: 1, mt: 2, color: "#ffd23f" }}>
      {children}
    </Typography>
  );
}

function ChipRow({ options, isActive, onPick }) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {options.map(([value, label]) => (
        <Chip
          key={value}
          label={label}
          onClick={() => onPick(value)}
          color={isActive(value) ? "primary" : "default"}
          variant={isActive(value) ? "filled" : "outlined"}
        />
      ))}
    </Box>
  );
}

const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

export function FilterPanel({ filters, onChange, resultCount }) {
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(filters);
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        <Badge badgeContent={count} color="secondary">
          <Button variant="contained" startIcon={<TuneIcon />} onClick={() => setOpen((v) => !v)}>
            Filters
          </Button>
        </Badge>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {resultCount} beers
        </Typography>
        <ChipRow
          options={SORTS}
          isActive={(v) => filters.sort === v}
          onPick={(v) => set({ sort: v })}
        />
      </Box>
      <Collapse in={open} unmountOnExit>
        <Box sx={{ p: 2, mt: 2, border: "3px solid rgba(0,229,255,0.5)", bgcolor: "rgba(16,12,38,0.85)" }}>
          <Label>STATUS</Label>
          <ChipRow options={STATUS} isActive={(v) => filters.status === v} onPick={(v) => set({ status: v })} />

          <Label>SESSION</Label>
          <ChipRow
            options={SESSIONS}
            isActive={(v) => filters.sessions.includes(v)}
            onPick={(v) => set({ sessions: toggle(filters.sessions, v) })}
          />

          <Label>STAND</Label>
          <Box sx={{ display: "flex", gap: 1 }}>
            {[1, 2, 3].map((stand) => (
              <Chip
                key={stand}
                label={`Stand ${stand}`}
                onClick={() => set({ stands: toggle(filters.stands, stand) })}
                variant={filters.stands.includes(stand) ? "filled" : "outlined"}
                sx={
                  filters.stands.includes(stand)
                    ? { bgcolor: `${STAND_COLORS[stand]} !important`, color: "#07070f !important" }
                    : { color: STAND_COLORS[stand] }
                }
              />
            ))}
          </Box>

          <Label>STYLE · tap to include, tap again to hide</Label>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {STYLE_CATEGORIES.map((category) => {
              const included = filters.styles.includes(category);
              const excluded = filters.excludeStyles.includes(category);
              const color = STYLE_META[category].color;
              const cycle = () => {
                if (!included && !excluded) set({ styles: [...filters.styles, category] });
                else if (included)
                  set({
                    styles: filters.styles.filter((v) => v !== category),
                    excludeStyles: [...filters.excludeStyles, category],
                  });
                else set({ excludeStyles: filters.excludeStyles.filter((v) => v !== category) });
              };
              return (
                <Chip
                  key={category}
                  onClick={cycle}
                  label={`${excluded ? "✕ " : included ? "✓ " : ""}${category} (${STYLE_COUNTS[category] ?? 0})`}
                  variant={included ? "filled" : "outlined"}
                  sx={
                    included
                      ? { bgcolor: `${color} !important`, color: "#07070f !important" }
                      : excluded
                        ? { color: "#ff5252", borderColor: "#ff5252 !important", textDecoration: "line-through" }
                        : { color, borderColor: `${color} !important` }
                  }
                />
              );
            })}
          </Box>

          <Label>
            ABV {filters.abv[0]}–{filters.abv[1]}%
          </Label>
          <Box sx={{ px: 1.5 }}>
            <Slider
              value={filters.abv}
              onChange={(_e, value) => set({ abv: value })}
              min={0}
              max={ABV_MAX}
              step={0.5}
              valueLabelDisplay="auto"
              disableSwap
            />
          </Box>

          <Label>
            UNTAPPD RATING {filters.rating[0].toFixed(1)}–{filters.rating[1].toFixed(1)}
          </Label>
          <Box sx={{ px: 1.5 }}>
            <Slider
              value={filters.rating}
              onChange={(_e, value) => set({ rating: value })}
              min={RATING_MIN}
              max={RATING_MAX}
              step={0.05}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => v.toFixed(2)}
              disableSwap
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            <Chip
              label="Only with Untappd rating"
              onClick={() => set({ onlyRated: !filters.onlyRated })}
              color={filters.onlyRated ? "primary" : "default"}
              variant={filters.onlyRated ? "filled" : "outlined"}
            />
            <Button size="small" variant="outlined" onClick={() => onChange(DEFAULT_FILTERS)} disabled={!count}>
              Reset
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
