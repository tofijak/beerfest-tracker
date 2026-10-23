import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { PIXEL_FONT } from "../theme";

export function CopyBlock({ title, code }) {
  const [copied, setCopied] = useState(false);
  return (
    <Box sx={{ mt: 1.5, mb: 2 }}>
      {title ? (
        <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.7rem", color: "#ffd23f", mb: 0.75 }}>
          {title}
        </Typography>
      ) : null}
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.5,
          overflow: "auto",
          bgcolor: "rgba(0,0,0,0.45)",
          border: "3px solid #07070f",
          boxShadow: "3px 3px 0 #2a1458",
          fontSize: "0.78rem",
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
        }}
      >
        {code}
      </Box>
      <Button
        size="small"
        sx={{ mt: 1 }}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </Box>
  );
}
