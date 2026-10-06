import { memo, useState } from "react";
import { sessionMetaMap } from "../festivals";
import {
  beerMatchesSession,
  FALLBACK_SESSION_META,
  formatBeerMeta,
  untappdSearchUrl,
} from "../utils";
import { Card, Checkbox, Chip, IconButton, IconExternal, IconStar, Slider } from "../ui";

function SessionChip({ session, festival }) {
  const meta =
    sessionMetaMap(festival)[session] ?? FALLBACK_SESSION_META[session] ?? FALLBACK_SESSION_META.all;
  const tone = session === "all" ? "nolo" : session;
  return <Chip tone={tone}>{meta.label}</Chip>;
}

function BeerItem({
  beer,
  brewery,
  festival,
  isDrunk,
  isFavorite,
  rating,
  onToggleDrunk,
  onToggleFavorite,
  onRatingChange,
}) {
  const [pop, setPop] = useState(false);
  const meta = formatBeerMeta(beer);
  const showSession = Boolean(beer.session && festival?.sessions?.length);

  return (
    <div className="beer-row" data-drunk={isDrunk} data-favorite={isFavorite}>
      <Checkbox checked={isDrunk} onChange={() => onToggleDrunk(beer.id)} label="" />
      <div>
        <div className="cluster">
          <p className="beer-name">{beer.name}</p>
          {showSession ? <SessionChip session={beer.session} festival={festival} /> : null}
          {beer.name !== "TBA" ? (
            <IconButton
              href={untappdSearchUrl(beer.name, brewery.name)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Search ${beer.name} on Untappd`}
              style={{ width: 32, height: 32 }}
              onClick={(event) => event.stopPropagation()}
            >
              <IconExternal />
            </IconButton>
          ) : null}
        </div>
        {meta ? (
          <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "var(--fs-sm)" }}>
            {meta}
          </p>
        ) : null}
        {beer.notes ? (
          <p className="muted" style={{ margin: "0.2rem 0 0", fontSize: "var(--fs-xs)" }}>
            {beer.notes}
          </p>
        ) : null}
        {isDrunk ? (
          <div style={{ marginTop: "0.75rem" }}>
            <Slider
              value={rating || 0}
              onChange={(value) => onRatingChange(beer.id, Math.round(value * 4) / 4)}
            />
          </div>
        ) : null}
      </div>
      <IconButton
        active={isFavorite}
        pop={pop}
        aria-label={isFavorite ? "Unstar beer" : "Star beer"}
        onClick={() => {
          setPop(true);
          window.setTimeout(() => setPop(false), 240);
          onToggleFavorite(beer.id);
        }}
      >
        <IconStar filled={isFavorite} />
      </IconButton>
    </div>
  );
}

const MemoBeerItem = memo(BeerItem);

function BreweryCard({
  brewery,
  festival,
  drunkBeers,
  favoriteBeers,
  beerRatings,
  onToggleDrunk,
  onToggleFavorite,
  onRatingChange,
  showOnlyFavorites = false,
  hideDrunkBeers = false,
  showOnlyUnrated = false,
  sessionFilter = "all",
}) {
  let beers = brewery.beers.filter((beer) => beerMatchesSession(beer, sessionFilter));
  if (showOnlyFavorites) beers = beers.filter((beer) => favoriteBeers.includes(beer.id));
  if (showOnlyUnrated) {
    beers = beers.filter(
      (beer) => drunkBeers.includes(beer.id) && beerRatings[beer.id] === undefined,
    );
  } else if (hideDrunkBeers) {
    beers = beers.filter((beer) => !drunkBeers.includes(beer.id));
  }

  if (beers.length === 0) return null;

  const tried = beers.filter((beer) => drunkBeers.includes(beer.id)).length;
  const locationLabel = brewery.stand
    ? `${brewery.location} · stand ${brewery.stand}`
    : brewery.location;

  return (
    <Card className="passport-card" padding="md" active={tried === beers.length && tried > 0}>
      <div className="brewery-head">
        <div>
          <div className="cluster">
            <h2 className="brewery-title">{brewery.name}</h2>
            {brewery.noLow ? <Chip tone="nolo">No/Low</Chip> : null}
          </div>
          {locationLabel ? (
            <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "var(--fs-sm)" }}>
              {locationLabel}
            </p>
          ) : null}
        </div>
        <Chip tone={tried === beers.length ? "green" : undefined}>
          {tried}/{beers.length} tried
        </Chip>
      </div>
      <div>
        {beers.map((beer) => (
          <MemoBeerItem
            key={beer.id}
            beer={beer}
            brewery={brewery}
            festival={festival}
            isDrunk={drunkBeers.includes(beer.id)}
            isFavorite={favoriteBeers.includes(beer.id)}
            rating={beerRatings[beer.id] || 0}
            onToggleDrunk={onToggleDrunk}
            onToggleFavorite={onToggleFavorite}
            onRatingChange={onRatingChange}
          />
        ))}
      </div>
    </Card>
  );
}

export const MemoBreweryCard = memo(BreweryCard);
