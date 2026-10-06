import { ratingOf, styleCategory } from "./utils";

export const ABV_MAX = 20;
export const RATING_MIN = 3;
export const RATING_MAX = 4.6;

export const DEFAULT_FILTERS = {
  status: "all", // all | untried | tried | unrated | favorites | planned
  sessions: [],
  stands: [],
  styles: [],
  excludeStyles: [],
  abv: [0, ABV_MAX],
  rating: [RATING_MIN, RATING_MAX],
  onlyRated: false,
  sort: "default", // default | rating | abv | name
};

export function activeFilterCount(filters) {
  return (
    (filters.status !== "all") +
    (filters.sessions.length > 0) +
    (filters.stands.length > 0) +
    (filters.styles.length > 0) +
    (filters.excludeStyles.length > 0) +
    (filters.abv[0] > 0 || filters.abv[1] < ABV_MAX) +
    (filters.rating[0] > RATING_MIN || filters.rating[1] < RATING_MAX) +
    filters.onlyRated
  );
}

function beerMatches(beer, brewery, filters, state, needle) {
  const { drunkBeers, favoriteBeers, plannedBeers, beerRatings } = state;
  if (needle) {
    const hay = `${beer.name} ${brewery.name} ${beer.style ?? ""}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  const tried = drunkBeers.includes(beer.id);
  switch (filters.status) {
    case "untried":
      if (tried) return false;
      break;
    case "tried":
      if (!tried) return false;
      break;
    case "unrated":
      if (!tried || beerRatings[beer.id] !== undefined) return false;
      break;
    case "favorites":
      if (!favoriteBeers.includes(beer.id)) return false;
      break;
    case "planned":
      if (!plannedBeers.includes(beer.id)) return false;
      break;
    default:
  }
  if (filters.sessions.length) {
    const ok = filters.sessions.some((s) => (s === "nolo" ? beer.session === "all" : beer.session === s));
    if (!ok) return false;
  }
  if (filters.stands.length && !filters.stands.includes(brewery.stand)) return false;
  const category = styleCategory(beer);
  if (filters.styles.length && !filters.styles.includes(category)) return false;
  if (filters.excludeStyles.includes(category)) return false;

  const [abvLo, abvHi] = filters.abv;
  if (abvLo > 0 || abvHi < ABV_MAX) {
    if (typeof beer.abv !== "number" || beer.abv < abvLo || beer.abv > abvHi) return false;
  }
  const rating = ratingOf(beer);
  const [rLo, rHi] = filters.rating;
  if (rLo > RATING_MIN || rHi < RATING_MAX) {
    if (rating == null || rating < rLo || rating > rHi) return false;
  }
  if (filters.onlyRated && rating == null) return false;
  return true;
}

/** Returns grouped `{ brewery, beers }[]`, or a single flat sorted group when a sort is chosen. */
export function applyFilters(filters, state, query, breweries) {
  const needle = query.toLowerCase().trim();
  const groups = breweries
    .map((brewery) => ({
      brewery,
      beers: brewery.beers.filter((beer) => beerMatches(beer, brewery, filters, state, needle)),
    }))
    .filter((group) => group.beers.length > 0);

  if (filters.sort === "default") return { groups, flat: null };

  const flat = groups.flatMap(({ brewery, beers }) => beers.map((beer) => ({ beer, brewery })));
  const sorters = {
    rating: (a, b) => (ratingOf(b.beer) ?? -1) - (ratingOf(a.beer) ?? -1),
    abv: (a, b) => (b.beer.abv ?? -1) - (a.beer.abv ?? -1),
    name: (a, b) => a.beer.name.localeCompare(b.beer.name),
  };
  flat.sort(sorters[filters.sort]);
  return { groups, flat };
}
