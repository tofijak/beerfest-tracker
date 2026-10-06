import { UNTAPPD } from "./data/untappd";

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

/** Minimum Untappd rating for each grade, best first. */
const GRADE_CUTOFFS = [4.35, 4.2, 4.1, 4.0, 3.85, 3.7, 3.55, 0];

export function gradeFromRating(rating) {
  if (typeof rating !== "number") return null;
  return GRADES[GRADE_CUTOFFS.findIndex((cutoff) => rating >= cutoff)];
}

/** Lower is better; unrated beers sort last. */
export function gradeRank(grade) {
  const index = GRADES.indexOf(grade);
  return index === -1 ? GRADES.length : index;
}

export function gradeColor(grade) {
  if (!grade) return "#546e7a";
  if (grade.startsWith("A")) return "#39ff88";
  if (grade.startsWith("B")) return "#ffd23f";
  return "#ff7a59";
}

/** Grade for a beer id, derived from its Untappd rating. */
export function beerGrade(beerId) {
  return gradeFromRating(UNTAPPD[beerId]?.rating);
}

export const STAND_COLORS = { 1: "#39ff88", 2: "#00e5ff", 3: "#ff2bd6" };
