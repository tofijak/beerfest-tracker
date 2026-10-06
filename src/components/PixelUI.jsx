import { Box, SvgIcon } from "@mui/material";
import { PIXEL_FONT } from "../theme";

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

/** Square grade plate with the Untappd score underneath. */
export function ScorePlate({ grade, rating, count, color }) {
  return (
    <Box sx={{ textAlign: "center", minWidth: 58 }}>
      <Box
        sx={{
          width: 52,
          height: 44,
          mx: "auto",
          display: "grid",
          placeItems: "center",
          bgcolor: grade ? color : "#241a4d",
          color: "#07070f",
          border: "3px solid #07070f",
          boxShadow: "3px 3px 0 #2a1458",
          fontFamily: PIXEL_FONT,
          fontWeight: 700,
          fontSize: "1.15rem",
        }}
      >
        {grade ?? "–"}
      </Box>
      <Box sx={{ fontFamily: PIXEL_FONT, fontSize: "0.7rem", mt: 0.75, color: "#eef1ff" }}>
        {rating != null ? rating.toFixed(2) : "n/a"}
      </Box>
      {count != null && (
        <Box sx={{ fontSize: "0.62rem", color: "text.secondary" }}>{count} ratings</Box>
      )}
    </Box>
  );
}
