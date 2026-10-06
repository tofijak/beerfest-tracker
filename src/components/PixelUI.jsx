import { Box, SvgIcon } from "@mui/material";
import { BODY_FONT } from "../theme";

/** Pixel checkbox glyphs for MUI's `icon` / `checkedIcon` props. */
export function PixelBoxIcon() {
  return (
    <SvgIcon viewBox="0 0 12 12" shapeRendering="crispEdges">
      <path fill="#00e5ff" d="M1 1h10v10H1z" />
      <path fill="#07070f" d="M2 2h8v8H2z" />
    </SvgIcon>
  );
}

export function PixelCheckedIcon() {
  return (
    <SvgIcon viewBox="0 0 12 12" shapeRendering="crispEdges">
      <path fill="#39ff88" d="M1 1h10v10H1z" />
      <path fill="#07070f" d="M2 2h8v8H2z" />
      <path fill="#39ff88" d="M3 3h6v6H3z" />
    </SvgIcon>
  );
}

export const pixelCheckboxProps = {
  icon: <PixelBoxIcon />,
  checkedIcon: <PixelCheckedIcon />,
  disableRipple: true,
};

/** Segmented progress bar, `segments` blocks wide. */
export function PixelBar({ value, total, color = "#39ff88", segments = 10 }) {
  const filled = total ? Math.round((value / total) * segments) : 0;
  return (
    <Box sx={{ display: "flex", gap: "3px" }} aria-label={`${value} of ${total}`}>
      {Array.from({ length: segments }, (_, index) => (
        <Box
          key={index}
          sx={{
            width: 10,
            height: 10,
            bgcolor: index < filled ? color : "#241a4d",
            boxShadow: index < filled ? `inset -2px -2px 0 rgba(0,0,0,0.35)` : "none",
          }}
        />
      ))}
    </Box>
  );
}

/** Square plate with the Untappd rating (the number itself) and rating count underneath. */
export function ScorePlate({ rating, count, color }) {
  return (
    <Box sx={{ textAlign: "center", minWidth: { xs: 48, sm: 58 } }}>
      <Box
        sx={{
          width: { xs: 48, sm: 56 },
          height: { xs: 38, sm: 44 },
          mx: "auto",
          display: "grid",
          placeItems: "center",
          bgcolor: rating != null ? color : "#241a4d",
          color: rating != null ? "#07070f" : "#9aa4c7",
          border: "3px solid #07070f",
          boxShadow: "3px 3px 0 #2a1458",
          fontFamily: BODY_FONT,
          fontWeight: 700,
          fontSize: { xs: "0.9rem", sm: "1.05rem" },
        }}
      >
        {rating != null ? rating.toFixed(2) : "–"}
      </Box>
      <Box sx={{ fontSize: "0.62rem", mt: 0.5, color: "text.secondary" }}>
        {count != null ? `${count} ratings` : "no rating"}
      </Box>
    </Box>
  );
}
