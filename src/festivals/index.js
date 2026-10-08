const modules = import.meta.glob("./*.json", { eager: true });

export const FESTIVALS = Object.values(modules)
  .map((mod) => mod.default)
  .filter((festival) => festival && typeof festival.slug === "string" && Array.isArray(festival.breweries))
  .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));

export function getFestival(slug) {
  return FESTIVALS.find((festival) => festival.slug === slug) ?? FESTIVALS[0] ?? null;
}

export function festivalStats(festival) {
  const beerCount = (festival?.breweries ?? []).reduce(
    (sum, brewery) => sum + (brewery.beers?.length ?? 0),
    0,
  );
  return {
    breweryCount: festival?.breweries?.length ?? 0,
    beerCount,
  };
}

export function findBeer(festival, beerId) {
  for (const brewery of festival?.breweries ?? []) {
    const beer = brewery.beers?.find(
      (item) => item.id === beerId || String(item.id) === String(beerId),
    );
    if (beer) return { beer, brewery, festival };
  }
  return null;
}

/** String IDs of beers on the current festival menu. Orphaned stored IDs are not included. */
export function knownBeerIds(festival) {
  const ids = new Set();
  for (const brewery of festival?.breweries ?? []) {
    for (const beer of brewery.beers ?? []) ids.add(String(beer.id));
  }
  return ids;
}

export function sessionMetaMap(festival) {
  return Object.fromEntries((festival?.sessions ?? []).map((session) => [session.id, session]));
}
