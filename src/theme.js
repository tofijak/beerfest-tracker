import { createTheme } from "@mui/material";

/** Square techno face: same neon-HUD vibe, with open numerals you can actually read. */
export const BODY_FONT = '"Chakra Petch", ui-sans-serif, system-ui, sans-serif';
export const PIXEL_FONT = BODY_FONT;
const INK = "#07070f";
const EDGE = "#00e5ff";
const SHADOW = "#2a1458";

/** Hard-edged "pixel" look: square corners, thick borders, offset block shadows that press in on click. */
const pressable = {
  borderRadius: 0,
  fontFamily: PIXEL_FONT,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  transition: "transform 60ms, box-shadow 60ms, background-color 120ms",
  "&:active": { transform: "translate(3px, 3px)", boxShadow: `0 0 0 ${SHADOW} !important` },
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: EDGE },
    secondary: { main: "#ff2bd6" },
    success: { main: "#39ff88" },
    background: { default: INK, paper: "rgba(16, 12, 38, 0.82)" },
    text: { primary: "#eef1ff", secondary: "#9aa4c7" },
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: BODY_FONT,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    body1: { fontSize: "1.2rem", lineHeight: 1.4, fontWeight: 500, fontVariantNumeric: "tabular-nums" },
    body2: { fontSize: "1.05rem", lineHeight: 1.45, fontWeight: 500, fontVariantNumeric: "tabular-nums" },
    caption: { fontSize: "0.95rem", lineHeight: 1.45, fontWeight: 500, fontVariantNumeric: "tabular-nums" },
    h4: { fontFamily: PIXEL_FONT, fontWeight: 700, lineHeight: 1.25 },
    h5: { fontFamily: PIXEL_FONT, fontWeight: 700, lineHeight: 1.25 },
    h6: { fontFamily: PIXEL_FONT, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1.3 },
    overline: { fontFamily: PIXEL_FONT, letterSpacing: "0.06em" },
    button: { fontFamily: PIXEL_FONT, fontWeight: 700 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backdropFilter: "blur(10px)",
          border: `3px solid ${EDGE}`,
          boxShadow: `6px 6px 0 ${SHADOW}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          ...pressable,
          border: `3px solid ${INK}`,
          boxShadow: `4px 4px 0 ${SHADOW}`,
          fontWeight: 700,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontFamily: PIXEL_FONT,
          fontWeight: 600,
          fontSize: "0.8rem",
          fontVariantNumeric: "tabular-nums",
          textTransform: "uppercase",
          border: "2px solid currentColor",
        },
        clickable: {
          ...pressable,
          boxShadow: `3px 3px 0 ${SHADOW}`,
          "&:active": { transform: "translate(2px, 2px)", boxShadow: "1px 1px 0 #2a1458" },
        },
        colorPrimary: { color: INK, borderColor: INK, backgroundColor: EDGE },
        filledPrimary: { "&:hover": { backgroundColor: "#5cf1ff" } },
        outlined: { borderColor: "rgba(0,229,255,0.5)" },
      },
    },
    MuiTabs: { styleOverrides: { indicator: { display: "none" }, flexContainer: { gap: 8 } } },
    MuiTab: {
      styleOverrides: {
        root: {
          ...pressable,
          minHeight: 48,
          border: `3px solid ${EDGE}`,
          boxShadow: `4px 4px 0 ${SHADOW}`,
          color: EDGE,
          fontSize: "0.85rem",
          fontVariantNumeric: "tabular-nums",
          "&.Mui-selected": { color: INK, backgroundColor: EDGE },
        },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 0, backgroundColor: "rgba(0,0,0,0.35)" },
        notchedOutline: { borderWidth: 3, borderColor: "rgba(0,229,255,0.6)" },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { height: 10 },
        rail: { borderRadius: 0, opacity: 1, backgroundColor: "#241a4d" },
        track: { borderRadius: 0, border: "none", backgroundImage: "linear-gradient(90deg,#00e5ff,#ff2bd6)" },
        thumb: {
          borderRadius: 0,
          width: 22,
          height: 22,
          backgroundColor: "#ffd23f",
          border: `3px solid ${INK}`,
          boxShadow: `3px 3px 0 ${SHADOW}`,
          "&:before": { display: "none" },
        },
        markLabel: {
          fontFamily: PIXEL_FONT,
          fontWeight: 600,
          fontSize: "0.85rem",
          fontVariantNumeric: "tabular-nums",
        },
        valueLabel: {
          borderRadius: 0,
          fontFamily: PIXEL_FONT,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          backgroundColor: "#ff2bd6",
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 0 } } },
  },
});
