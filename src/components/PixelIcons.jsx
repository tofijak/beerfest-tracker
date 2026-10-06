import { ButtonBase, SvgIcon } from "@mui/material";

const GRIDS = {
  star: ["...#...", "...#...", "#######", ".#####.", "..###..", ".##.##.", ".#...#."],
  plus: ["...#...", "...#...", "...#...", "#######", "...#...", "...#...", "...#..."],
  check: [".......", "......#", ".....##", "#...##.", ".#.##..", "..###..", "...#..."],
  trash: [".#####.", "#######", ".#...#.", ".#.#.#.", ".#.#.#.", ".#.#.#.", ".#####."],
  up: ["...#...", "..###..", ".#####.", "#######", "..###..", "..###..", "..###.."],
  down: ["..###..", "..###..", "..###..", "#######", ".#####.", "..###..", "...#..."],
  close: ["#.....#", ".#...#.", "..#.#..", "...#...", "..#.#..", ".#...#.", "#.....#"],
  external: [".......", "...#...", "....#..", "#######", "....#..", "...#...", "......."],
  list: ["#.#####", ".......", "#.#####", ".......", "#.#####", ".......", "#.#####"],
};

export function PixelIcon({ name, size = 20, ...props }) {
  const rows = GRIDS[name];
  return (
    <SvgIcon viewBox="0 0 7 7" shapeRendering="crispEdges" sx={{ fontSize: size }} {...props}>
      {rows.flatMap((row, y) =>
        [...row].map((char, x) =>
          char === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="currentColor" /> : null,
        ),
      )}
    </SvgIcon>
  );
}

/** Chunky square pixel button with a hard shadow; fills with `color` when active. */
export function PixelIconButton({ icon, label, active = false, color = "#00e5ff", onClick, disabled, size = 36, iconSize = 20 }) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor: active ? color : "#07070f",
        color: active ? "#07070f" : color,
        border: `3px solid ${active ? "#07070f" : color}`,
        boxShadow: "3px 3px 0 #2a1458",
        transition: "transform 60ms, box-shadow 60ms, background-color 120ms",
        "&:hover": { bgcolor: active ? color : "rgba(255,255,255,0.08)" },
        "&:active": { transform: "translate(3px, 3px)", boxShadow: "0 0 0 #2a1458" },
        "&.Mui-disabled": { opacity: 0.3 },
        "&:focus-visible": { outline: "2px solid #ffd23f", outlineOffset: 2 },
      }}
    >
      <PixelIcon name={icon} size={iconSize} />
    </ButtonBase>
  );
}
