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

export const SESSION_META = {
  green: { label: "Green", color: "#2e7d32" },
  yellow: { label: "Yellow", color: "#f9a825" },
  red: { label: "Red", color: "#c62828" },
  all: { label: "No/Low", color: "#546e7a" },
};

export const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

/** Lower is better; ungraded beers sort last. */
export function gradeRank(grade) {
  const index = GRADES.indexOf(grade);
  return index === -1 ? GRADES.length : index;
}

export function gradeColor(grade) {
  if (!grade) return "#546e7a";
  if (grade.startsWith("A")) return "#2e7d32";
  if (grade.startsWith("B")) return "#f9a825";
  return "#8d6e63";
}

export const STAND_COLORS = { 1: "#2e7d32", 2: "#1565c0", 3: "#c62828" };
