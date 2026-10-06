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

export function ratingOf(beerId) {
  return UNTAPPD[beerId]?.rating ?? null;
}

export function ratingColor(rating) {
  if (rating == null) return "#546e7a";
  if (rating >= 4.2) return "#39ff88";
  if (rating >= 3.9) return "#ffd23f";
  return "#ff7a59";
}

/** Broad style buckets used for badges and filtering. Order matters in styleCategory(). */
export const STYLE_META = {
  "Hazy IPA": { color: "#ffb74d", short: "NEIPA" },
  "West Coast IPA": { color: "#aed581", short: "WCIPA" },
  IPA: { color: "#ffd23f", short: "IPA" },
  "Pale Ale": { color: "#fff176", short: "PALE" },
  "Stout / Porter": { color: "#a1887f", short: "DARK" },
  "Sour / Fruited": { color: "#ff6ec7", short: "SOUR" },
  "Wild / Lambic": { color: "#e040fb", short: "WILD" },
  "Lager / Pils": { color: "#4dd0e1", short: "LAGER" },
  Saison: { color: "#c5e1a5", short: "SAISON" },
  "Barleywine / Strong": { color: "#ff7a59", short: "STRONG" },
  "Mead / Other": { color: "#b39ddb", short: "OTHER" },
  "No / Low": { color: "#90a4ae", short: "NO/LO" },
};

export const STYLE_CATEGORIES = Object.keys(STYLE_META);

export function styleCategory(beer) {
  if (beer.session === "all") return "No / Low";
  const style = (beer.style ?? "").toLowerCase();
  if (/barley ?wine|wee heavy|strong ale/.test(style)) return "Barleywine / Strong";
  if (/stout|porter/.test(style)) return "Stout / Porter";
  if (/wild|lambic|flanders|oud bruin|gruit|brett|grisette|spontaneous/.test(style))
    return "Wild / Lambic";
  if (/sour|gose|smoothie|proxy/.test(style)) return "Sour / Fruited";
  if (/(^|\W)ne(ipa)?(\W|$)|neipa|hazy|milkshake/.test(style)) return "Hazy IPA";
  if (/\bwc\b|west coast|brut/.test(style)) return "West Coast IPA";
  if (/ipa|tipa/.test(style)) return "IPA";
  if (/saison|farmhouse|table beer/.test(style)) return "Saison";
  if (/pils|lager|helles|märzen|festbier|keller|bock|shandy/.test(style)) return "Lager / Pils";
  if (/pale ale|bitter|brown ale|witbier/.test(style)) return "Pale Ale";
  return "Mead / Other";
}

export function styleBadgeData(beer) {
  const category = styleCategory(beer);
  return { category, ...STYLE_META[category] };
}

export const STAND_COLORS = { 1: "#39ff88", 2: "#00e5ff", 3: "#ff2bd6" };
