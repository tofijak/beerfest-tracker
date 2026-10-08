const NAME_MAX = 24;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,24}$/;

/** Full-match patterns mirrored in firestore.rules (rules `matches` is already anchored). */
export const ROSTER_ID_LIST = /^[A-Za-z0-9_-]{1,24}(,[A-Za-z0-9_-]{1,24})*$/;
export const ROSTER_RATINGS =
  /^[A-Za-z0-9_-]{1,24}:(0[.](25|5|75)|[1-4]([.](25|5|75))?|5)(,[A-Za-z0-9_-]{1,24}:(0[.](25|5|75)|[1-4]([.](25|5|75))?|5))*$/;

export function safeSlug(slug) {
  return typeof slug === "string" && /^[A-Za-z0-9-]{1,80}$/.test(slug);
}

function cleanName(value) {
  let text = String(value ?? "").replace(/[\r\n\t]/g, " ").trim();
  if (text.includes("@")) text = text.split("@")[0].trim();
  text = text.replace(/\s+/g, " ").trim();
  return text.slice(0, NAME_MAX).trim();
}

/** Board name. Emails are reduced to the part before @ so the public doc never stores one. */
export function publicName(name, email) {
  return cleanName(name) || cleanName(email) || "Anonymous";
}

export function isPublicName(name) {
  return (
    typeof name === "string" &&
    name.length >= 1 &&
    name.length <= NAME_MAX &&
    /^[^@\n\r]+$/.test(name) &&
    /\S/.test(name) &&
    name.trim() === name
  );
}

/** Canonical 0.25-step token from 0.25 through 5, or null when the value is blank. */
export function formatQuarter(value) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  const quarters = Math.round(number * 4);
  if (quarters <= 0 || quarters > 20) return null;
  const whole = Math.floor(quarters / 4);
  const remainder = quarters % 4;
  if (remainder === 0) return String(whole);
  if (remainder === 1) return `${whole}.25`;
  if (remainder === 2) return `${whole}.5`;
  return `${whole}.75`;
}

function compareIds(a, b) {
  const left = Number(a);
  const right = Number(b);
  if (Number.isFinite(left) && Number.isFinite(right) && left !== right) return left - right;
  return a.localeCompare(b);
}

export function cleanIds(values) {
  const seen = new Set();
  const ids = [];
  for (const value of values ?? []) {
    const id = String(value);
    if (!ID_PATTERN.test(id) || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  ids.sort(compareIds);
  return ids;
}

const RATING_TOKEN = /^(0\.(25|5|75)|[1-4](\.(25|5|75))?|5)$/;

export function parseIdList(value) {
  if (typeof value !== "string" || value === "") return [];
  return cleanIds(value.split(","));
}

export function parseRatings(value) {
  const ratings = {};
  if (typeof value !== "string" || value === "") return ratings;
  for (const part of value.split(",")) {
    const splitAt = part.indexOf(":");
    if (splitAt <= 0) continue;
    const id = part.slice(0, splitAt);
    const raw = part.slice(splitAt + 1);
    if (!ID_PATTERN.test(id) || !RATING_TOKEN.test(raw)) continue;
    ratings[id] = Number(raw);
  }
  return ratings;
}

export function rosterPayload(progress, name, email) {
  const ratings = [];
  for (const [id, value] of Object.entries(progress?.beerRatings ?? {})) {
    if (!ID_PATTERN.test(String(id))) continue;
    const token = formatQuarter(value);
    if (token == null) continue;
    ratings.push(`${id}:${token}`);
  }
  ratings.sort((a, b) => compareIds(a.slice(0, a.indexOf(":")), b.slice(0, b.indexOf(":"))));

  return {
    name: publicName(name, email),
    drunk: cleanIds(progress?.drunkBeers).join(","),
    favorites: cleanIds(progress?.favoriteBeers).join(","),
    ratings: ratings.join(","),
  };
}

export function filterPayload(payload, knownIds) {
  if (!knownIds) return payload;
  const keep = (id) => knownIds.has(id);
  return {
    name: payload.name,
    drunk: payload.drunk.split(",").filter((id) => id && keep(id)).join(","),
    favorites: payload.favorites.split(",").filter((id) => id && keep(id)).join(","),
    ratings: payload.ratings
      .split(",")
      .filter((part) => part && keep(part.slice(0, part.indexOf(":"))))
      .join(","),
  };
}

export function personFromPayload(id, payload) {
  return {
    id,
    name: payload.name,
    drunkBeerIds: parseIdList(payload.drunk),
    favoriteBeerIds: parseIdList(payload.favorites),
    ratings: parseRatings(payload.ratings),
  };
}

export function personFromProgress(id, progress, name, email) {
  return personFromPayload(id, rosterPayload(progress, name, email));
}

export function parseRosterDoc(id, data) {
  if (!data || typeof data !== "object") return null;
  if (typeof data.name !== "string") return null;
  if (data.hidden === true) return null;
  return personFromPayload(id, {
    name: publicName(data.name),
    drunk: typeof data.drunk === "string" ? data.drunk : "",
    favorites: typeof data.favorites === "string" ? data.favorites : "",
    ratings: typeof data.ratings === "string" ? data.ratings : "",
  });
}

export function mergeSelf(people, self) {
  if (!self) return people ?? [];
  return [...(people ?? []).filter((person) => person.id !== self.id), self];
}

export function withoutPerson(people, id) {
  if (!id) return people ?? [];
  return (people ?? []).filter((person) => person.id !== id);
}

export function rosterErrorMessage(error) {
  const code = String(error?.code ?? "");
  if (code.includes("permission-denied")) {
    return "The board is locked. Publish the latest Firestore rules so signed-in check-ins can be shared.";
  }
  return "Couldn't load the festival board. Check your connection and try again.";
}
