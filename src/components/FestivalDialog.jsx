import { FESTIVALS, festivalStats } from "../festivals";
import { hasFestivalActivity, ratedCountFrom } from "../lib/storage";
import { Card, Chip, Sheet } from "../ui";

export function FestivalDialog({ open, onClose, activeSlug, allProgress, onSelect }) {
  return (
    <Sheet open={open} onClose={onClose} title="Pick a festival">
      <p className="lede">Ratings stay on the festival you poured them at. Switch anytime.</p>
      <div className="stack">
        {FESTIVALS.map((festival) => {
          const stats = festivalStats(festival);
          const progress = allProgress[festival.slug];
          const visited = hasFestivalActivity(progress);
          const rated = ratedCountFrom(progress?.beerRatings);
          const selected = festival.slug === activeSlug;
          return (
            <Card
              key={festival.slug}
              as="button"
              type="button"
              padding="md"
              active={selected}
              onClick={() => {
                onSelect(festival.slug);
                onClose();
              }}
              style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
            >
              <div className="brewery-head">
                <div>
                  <h3 className="display" style={{ margin: 0, fontSize: "var(--fs-xl)" }}>
                    {festival.name}
                    {festival.edition ? ` ${festival.edition}` : ""}
                  </h3>
                  <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "var(--fs-sm)" }}>
                    {[festival.venue, festival.dateLabel || festival.date, `${stats.beerCount} beers`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Chip tone={visited ? "green" : undefined}>
                  {visited ? `${rated} rated` : "Not started"}
                </Chip>
              </div>
            </Card>
          );
        })}
      </div>
    </Sheet>
  );
}
