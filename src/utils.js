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

/** Broad style bucket for filtering; the PDF's style strings are free text. */
export const STYLE_CATEGORIES = [
  "IPA",
  "Pale Ale",
  "Stout / Porter",
  "Sour / Wild",
  "Lager / Pils",
  "Saison",
  "Barleywine / Strong",
  "Mead / Other",
  "No / Low",
];

export function styleCategory(beer) {
  if (beer.session === "all") return "No / Low";
  const style = (beer.style ?? "").toLowerCase();
  if (/barley ?wine|wee heavy|strong ale/.test(style)) return "Barleywine / Strong";
  if (/stout|porter/.test(style)) return "Stout / Porter";
  if (/sour|wild|lambic|gose|flanders|oud bruin|gruit|brett|grisette|smoothie|proxy/.test(style))
    return "Sour / Wild";
  if (/ipa|tipa/.test(style)) return "IPA";
  if (/saison|farmhouse|table beer/.test(style)) return "Saison";
  if (/pils|lager|helles|märzen|festbier|keller|bock|shandy/.test(style)) return "Lager / Pils";
  if (/pale ale|bitter|brown ale|witbier/.test(style)) return "Pale Ale";
  return "Mead / Other";
}

export const STAND_COLORS = { 1: "#39ff88", 2: "#00e5ff", 3: "#ff2bd6" };
