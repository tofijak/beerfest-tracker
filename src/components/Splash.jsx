import { Button } from "../ui";

export function Splash({ open, festival, onDismiss }) {
  if (!open || !festival) return null;

  return (
    <div className="splash" onClick={onDismiss} role="presentation">
      <div>
        <p className="kicker" style={{ color: "#ffd56a", letterSpacing: "0.18em" }}>
          {festival.name}
          {festival.edition ? ` · ${festival.edition}` : ""}
        </p>
        <h1>{festival.tagline || "Check it. Star it. Rate it."}</h1>
        <p className="lede" style={{ color: "#f3d9b0" }}>
          {festival.splashBody ||
            [festival.venue, festival.dateLabel || festival.date].filter(Boolean).join(" · ")}
        </p>
        <Button variant="primary" size="lg" onClick={onDismiss}>
          {festival.splashCta || "Let's go"}
        </Button>
      </div>
    </div>
  );
}
