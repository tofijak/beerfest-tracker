export function untappdSearchUrl(beerName, breweryName) {
  return `https://untappd.com/search?q=${encodeURIComponent(`${beerName} ${breweryName}`)}&type=beer`;
}

export function formatBeerMeta(beer) {
  const parts = [];
  if (beer.style) parts.push(beer.style);
  if (typeof beer.abv === "number") {
    parts.push(`${beer.abv}% ABV`);
  } else if (beer.name !== "TBA") {
    parts.push("ABV N/A");
  }
  return parts.join(" • ");
}

export function beerMatchesSession(beer, sessionFilter) {
  if (!sessionFilter || sessionFilter === "all") return true;
  if (sessionFilter === "nolo") return beer.session === "all";
  return beer.session === sessionFilter || beer.session === "all";
}

export function sessionFilterValue(session) {
  return session.id === "all" ? "nolo" : session.id;
}

export const FALLBACK_SESSION_META = {
  green: { label: "Green", color: "#2e7d32" },
  yellow: { label: "Yellow", color: "#f9a825" },
  red: { label: "Red", color: "#c62828" },
  all: { label: "No/Low", color: "#546e7a" },
};
