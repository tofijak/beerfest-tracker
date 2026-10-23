import { FESTIVALS, findBeer } from "../festivals";
import { untappdSearchUrl } from "../utils";

export const EXPORT_VERSION = 1;

function timestampToIso(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (typeof value === "string") return value;
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000).toISOString();
  return null;
}

/** Ratings, stars and check-offs for one festival, joined with the beer list. Orphaned IDs are skipped. */
export function festivalExport(festival, progress, updatedAt = null) {
  const ratings = progress?.beerRatings ?? {};
  const favorites = new Set((progress?.favoriteBeers ?? []).map(String));
  const tasted = new Set((progress?.drunkBeers ?? []).map(String));
  const ids = new Set([...Object.keys(ratings), ...favorites, ...tasted]);

  const rows = [];
  for (const id of ids) {
    const match = findBeer(festival, id);
    if (!match) continue;
    const { beer, brewery } = match;
    const value = ratings[id] ?? ratings[beer.id];
    const rating = typeof value === "number" && value > 0 ? value : null;
    const isFavorite = favorites.has(String(beer.id));
    const isTasted = tasted.has(String(beer.id));
    if (rating == null && !isFavorite && !isTasted) continue;
    rows.push({
      beerId: beer.id,
      name: beer.name,
      brewery: brewery.name,
      style: beer.style ?? null,
      abv: typeof beer.abv === "number" ? beer.abv : null,
      session: beer.session ?? null,
      untappdUrl: beer.untappd?.url ?? null,
      untappdSearchUrl: beer.name === "TBA" ? null : untappdSearchUrl(beer.name, brewery.name),
      rating,
      favorite: isFavorite,
      tasted: isTasted,
    });
  }
  rows.sort((a, b) => String(a.brewery).localeCompare(String(b.brewery)) || String(a.name).localeCompare(String(b.name)));

  return {
    slug: festival.slug,
    name: festival.name,
    edition: festival.edition ?? null,
    date: festival.date ?? null,
    venue: festival.venue ?? null,
    updatedAt: timestampToIso(updatedAt),
    ratings: rows,
  };
}

/**
 * Build the export document.
 * `entries` maps festival slug -> { progress, updatedAt }.
 */
export function buildExport({ user, displayName, entries, festivalSlug = null, source }) {
  const festivals = FESTIVALS.filter((festival) => !festivalSlug || festival.slug === festivalSlug).map(
    (festival) => festivalExport(festival, entries[festival.slug]?.progress, entries[festival.slug]?.updatedAt),
  );
  return {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    source,
    user: user
      ? { email: user.email ?? null, displayName: displayName || user.displayName || null }
      : null,
    festivals,
  };
}
