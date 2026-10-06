import { FESTIVALS, festivalStats, findBeer } from "../festivals";
import { hasFestivalActivity, ratedCountFrom } from "../lib/storage";
import { formatBeerMeta, untappdSearchUrl } from "../utils";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  IconBeer,
  IconButton,
  IconExternal,
  IconStar,
} from "../ui";

function collectRatedBeers(allProgress) {
  const rated = [];
  for (const festival of FESTIVALS) {
    const progress = allProgress[festival.slug];
    if (!progress) continue;
    for (const [beerId, rating] of Object.entries(progress.beerRatings ?? {})) {
      if (typeof rating !== "number" || rating <= 0) continue;
      const match = findBeer(festival, Number.isNaN(Number(beerId)) ? beerId : Number(beerId));
      if (!match) continue;
      rated.push({
        key: `${festival.slug}:${beerId}`,
        rating,
        festival,
        beer: match.beer,
        brewery: match.brewery,
        favorite: progress.favoriteBeers?.includes(match.beer.id),
      });
    }
  }
  return rated.sort((a, b) => b.rating - a.rating || a.beer.name.localeCompare(b.beer.name));
}

function collectFavorites(allProgress) {
  const favorites = [];
  for (const festival of FESTIVALS) {
    const progress = allProgress[festival.slug];
    for (const beerId of progress?.favoriteBeers ?? []) {
      const match = findBeer(festival, beerId);
      if (!match) continue;
      favorites.push({
        key: `${festival.slug}:${beerId}`,
        rating: progress.beerRatings?.[beerId] || progress.beerRatings?.[String(beerId)] || 0,
        festival,
        beer: match.beer,
        brewery: match.brewery,
      });
    }
  }
  return favorites.sort((a, b) => b.rating - a.rating || a.beer.name.localeCompare(b.beer.name));
}

function BeerRow({ item }) {
  return (
    <div className="rated-row">
      <div>
        <div className="cluster">
          <strong>{item.beer.name}</strong>
          {item.rating > 0 ? <Chip tone="yellow">{item.rating.toFixed(2)}</Chip> : null}
          {item.favorite ? <IconStar filled size={16} /> : null}
        </div>
        <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "var(--fs-sm)" }}>
          {item.brewery.name}
          {formatBeerMeta(item.beer) ? ` · ${formatBeerMeta(item.beer)}` : ""}
        </p>
        <p className="muted" style={{ margin: "0.15rem 0 0", fontSize: "var(--fs-xs)" }}>
          {item.festival.name}
          {item.festival.edition ? ` ${item.festival.edition}` : ""}
        </p>
      </div>
      {item.beer.name !== "TBA" ? (
        <IconButton
          href={untappdSearchUrl(item.beer.name, item.brewery.name)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Search ${item.beer.name} on Untappd`}
        >
          <IconExternal />
        </IconButton>
      ) : null}
    </div>
  );
}

export function HistoryView({ allProgress, activeSlug, onSelectFestival }) {
  const visited = FESTIVALS.filter((festival) => hasFestivalActivity(allProgress[festival.slug]));
  const topRated = collectRatedBeers(allProgress).slice(0, 20);
  const favorites = collectFavorites(allProgress).slice(0, 20);

  return (
    <div className="stack" style={{ gap: "var(--space-6)" }}>
      <div>
        <h2 className="display" style={{ margin: "0 0 0.4rem", fontSize: "var(--fs-2xl)" }}>
          Your festival passport
        </h2>
        <p className="lede">
          {visited.length === 0
            ? "No stamps yet — check off a beer and this page starts filling in."
            : `${visited.length} festival${visited.length === 1 ? "" : "s"} on your card.`}
        </p>
      </div>

      {FESTIVALS.map((festival) => {
        const stats = festivalStats(festival);
        const progress = allProgress[festival.slug] ?? {};
        const visitedFest = hasFestivalActivity(progress);
        const rated = ratedCountFrom(progress.beerRatings);
        const tried = progress.drunkBeers?.length ?? 0;
        const stars = progress.favoriteBeers?.length ?? 0;

        return (
          <Card key={festival.slug} className="passport-card" active={festival.slug === activeSlug}>
            <div className="brewery-head">
              <div>
                <h3 className="display" style={{ margin: 0, fontSize: "var(--fs-xl)" }}>
                  {festival.name}
                </h3>
                <p className="muted" style={{ margin: "0.4rem 0 0", fontSize: "var(--fs-sm)" }}>
                  {festival.venue}
                  {festival.dateLabel || festival.date
                    ? ` · ${festival.dateLabel || festival.date}`
                    : ""}
                </p>
              </div>
              <Chip tone={visitedFest ? "green" : undefined}>
                {visitedFest ? "Been there" : "On the list"}
              </Chip>
            </div>
            <p className="muted" style={{ margin: "0 0 1rem", fontSize: "var(--fs-sm)" }}>
              {stats.beerCount} beers · {stats.breweryCount} breweries
              {visitedFest ? ` · ${rated} rated · ${tried} tried · ${stars} starred` : ""}
            </p>
            {festival.slug !== activeSlug ? (
              <Button onClick={() => onSelectFestival(festival.slug)}>Open this festival</Button>
            ) : (
              <p className="muted" style={{ margin: 0, fontSize: "var(--fs-xs)" }}>
                You are here
              </p>
            )}
          </Card>
        );
      })}

      <div>
        <h2 className="display" style={{ margin: "0 0 0.6rem", fontSize: "var(--fs-2xl)" }}>
          All-time hall of foam
        </h2>
        {topRated.length === 0 ? (
          <EmptyState
            icon={<IconBeer size={28} />}
            title="No scores yet"
            body="Rate a pour and it lands here — across every festival you visit."
          />
        ) : (
          <Card padding="md">
            {topRated.map((item) => (
              <BeerRow key={item.key} item={item} />
            ))}
          </Card>
        )}
      </div>

      <div>
        <h2 className="display" style={{ margin: "0 0 0.6rem", fontSize: "var(--fs-2xl)" }}>
          Starred across fests
        </h2>
        {favorites.length === 0 ? (
          <EmptyState
            icon={<IconStar size={28} />}
            title="No stars yet"
            body="Star a beer and it stays in your passport."
          />
        ) : (
          <Card padding="md">
            {favorites.map((item) => (
              <BeerRow key={item.key} item={item} />
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
