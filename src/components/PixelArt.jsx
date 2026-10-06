import { Box } from "@mui/material";

const PALETTES = {
  mug: { o: "#0b0b1a", g: "#ffd23f", f: "#fff7d6", h: "#ffffff", m: "#8fd8ff", d: "#2a2a4a" },
  hop: { o: "#0b0b1a", g: "#39ff88", d: "#0f9d4f", l: "#b6ffd2" },
  can: { o: "#0b0b1a", a: "#00e5ff", b: "#ff2bd6", w: "#ffffff", s: "#9aa4c7" },
  logo: { w: "#e9e4ff", h: "#ffffff", d: "#8f86c9" },
};

const SPRITES = {
  logo: [
    "....hhhhhh....hhhhhh....",
    "...hwwwwwd....hwwwwwh...",
    "..hwwwwwwd....hwwwwwwh..",
    ".hwwwwwwwd....hwwwwwwwh.",
    "hwwwwddddd....hddddwwwwh",
    "hwwwd.....hhhh.....hwwwd",
    "hwwwd.....hwwd.....hwwwd",
    "hwwwd.....hwwd.....hwwwd",
    "hwwwd.....hddd.....hwwwd",
    "hwwwwhhhhh....hhhhhwwwwd",
    ".hwwwwwwwd....hwwwwwwwd.",
    "..hwwwwwwd....hwwwwwwd..",
    "...hwwwwwd....hwwwwwd...",
    "....hddddd....hddddd....",
  ],
  mug: [
    "..hhhhhhhh......",
    ".hffhhfhfhh.....",
    ".hfhhffhhfh.....",
    ".oooooooooo.....",
    ".ogggggggggooo..",
    ".ogggggggggo.o..",
    ".ogggggggggo.o..",
    ".ogggggggggo.o..",
    ".ogggggggggo.o..",
    ".ogggggggggo.o..",
    ".ogggggggggo.o..",
    ".ogggggggggooo..",
    ".ogggggggggo....",
    ".oooooooooo.....",
    "................",
    "................",
  ],
  hop: [
    ".......oo.......",
    "......oggo......",
    ".....oggddo.....",
    "....oggllddo....",
    "...oggggdddo....",
    "..oggglgdddo....",
    "..oggggdddddo...",
    "..ogglgdddddo...",
    "...oggggddddo...",
    "...ogglgdddo....",
    "....oggggddo....",
    ".....oggddo.....",
    "......oddo......",
    ".......oo.......",
    "................",
    "................",
  ],
  can: [
    "...oooooooo.....",
    "...osssssso.....",
    "...oaaaaaao.....",
    "...oawwwwao.....",
    "...oaaaaaao.....",
    "...obbbbbbo.....",
    "...obwwwwbo.....",
    "...obbbbbbo.....",
    "...oaaaaaao.....",
    "...oawwwwao.....",
    "...oaaaaaao.....",
    "...obbbbbbo.....",
    "...osssssso.....",
    "...oooooooo.....",
    "................",
    "................",
  ],
};

/** Voxel-style sprite: the pixel grid is stacked in CSS 3D layers to fake depth. */
export function PixelSprite({ sprite = "mug", size = 96, depth = 8, spin = true, sx }) {
  const rows = SPRITES[sprite];
  const palette = PALETTES[sprite];
  const cols = rows[0].length;
  const cell = size / cols;
  const height = cell * rows.length;
  const layers = Array.from({ length: depth }, (_, index) => index);

  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height,
        perspective: 700,
        pointerEvents: "none",
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          animation: spin ? "pixelSpin 7s ease-in-out infinite" : "none",
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        {layers.map((layer) => (
          <Box
            key={layer}
            component="svg"
            viewBox={`0 0 ${cols} ${rows.length}`}
            shapeRendering="crispEdges"
            sx={{
              position: "absolute",
              inset: 0,
              width: size,
              height,
              transform: `translateZ(${(layer - depth / 2) * (cell * 0.6)}px)`,
              filter: layer === depth - 1 ? "none" : `brightness(${0.45 + (layer / depth) * 0.4})`,
            }}
          >
            {rows.flatMap((row, y) =>
              [...row].map((char, x) =>
                char === "." ? null : (
                  <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={palette[char]} />
                ),
              ),
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Fixed background: neon perspective grid floor plus drifting voxel sprites. */
export function PixelBackdrop() {
  const floaters = [
    { sprite: "mug", top: "14%", left: "3%", size: 84, delay: "0s" },
    { sprite: "hop", top: "46%", right: "2%", size: 76, delay: "-2s" },
    { sprite: "can", top: "74%", left: "5%", size: 72, delay: "-4s" },
    { sprite: "mug", top: "88%", right: "6%", size: 64, delay: "-1s" },
  ];
  return (
    <Box
      aria-hidden
      sx={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "-50%",
          right: "-50%",
          bottom: 0,
          height: "55%",
          transform: "perspective(500px) rotateX(62deg)",
          transformOrigin: "bottom",
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,43,214,0.22) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to top, #000 10%, transparent 90%)",
          animation: "gridScroll 3s linear infinite",
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      />
      {floaters.map(({ delay, size, sprite, ...pos }, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            ...pos,
            opacity: 0.55,
            display: { xs: "none", md: "block" },
            animation: "floatY 6s ease-in-out infinite",
            animationDelay: delay,
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        >
          <PixelSprite sprite={sprite} size={size} />
        </Box>
      ))}
    </Box>
  );
}
