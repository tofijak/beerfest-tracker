const APP_PREFIX = "beerFest.";
// Historical localStorage prefix from the first single-festival build.
const LEGACY_PREFIX = atob("Z3JlZW5TZXNzaW9uLnNlcnBpZXIu");

export const DEFAULT_FESTIVAL_SLUG = "raise-the-bar-2026";

export const FESTIVAL_PROGRESS_KEYS = [
  "sessionFilter",
  "drunkBeers",
  "favoriteBeers",
  "hideDrunkBeers",
  "beerRatings",
  "showOnlyUnrated",
  "achievedMilestones",
];

export const EMPTY_PROGRESS = {
  sessionFilter: "all",
  drunkBeers: [],
  favoriteBeers: [],
  hideDrunkBeers: false,
  beerRatings: {},
  showOnlyUnrated: false,
  achievedMilestones: [],
};

export function festivalStorageKey(slug, suffix) {
  return `${APP_PREFIX}festivals.${slug}.${suffix}`;
}

export function activeFestivalKey() {
  return `${APP_PREFIX}activeFestival`;
}

export function emailForSignInKey() {
  return `${APP_PREFIX}emailForSignIn`;
}

export function splashStorageKey(slug) {
  return `${APP_PREFIX}splashSeen.${slug}`;
}

export function displayNameKey() {
  return `${APP_PREFIX}displayName`;
}

export function shareScoreboardKey() {
  return `${APP_PREFIX}shareScoreboard`;
}

export function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export function migrateLegacyStorage(targetSlug = DEFAULT_FESTIVAL_SLUG) {
  if (typeof window === "undefined") return false;

  const hasLegacy = FESTIVAL_PROGRESS_KEYS.some(
    (key) => window.localStorage.getItem(`${LEGACY_PREFIX}${key}`) != null,
  );
  if (!hasLegacy) return false;

  const alreadyMigrated = FESTIVAL_PROGRESS_KEYS.some(
    (key) => window.localStorage.getItem(festivalStorageKey(targetSlug, key)) != null,
  );
  if (alreadyMigrated) return false;

  for (const key of FESTIVAL_PROGRESS_KEYS) {
    const value = window.localStorage.getItem(`${LEGACY_PREFIX}${key}`);
    if (value != null) {
      window.localStorage.setItem(festivalStorageKey(targetSlug, key), value);
    }
  }
  return true;
}

export function loadFestivalProgress(slug) {
  return {
    sessionFilter: readJson(festivalStorageKey(slug, "sessionFilter"), "all"),
    drunkBeers: readJson(festivalStorageKey(slug, "drunkBeers"), []),
    favoriteBeers: readJson(festivalStorageKey(slug, "favoriteBeers"), []),
    hideDrunkBeers: readJson(festivalStorageKey(slug, "hideDrunkBeers"), false),
    beerRatings: readJson(festivalStorageKey(slug, "beerRatings"), {}),
    showOnlyUnrated: readJson(festivalStorageKey(slug, "showOnlyUnrated"), false),
    achievedMilestones: readJson(festivalStorageKey(slug, "achievedMilestones"), []),
  };
}

export function saveFestivalProgress(slug, progress) {
  for (const key of FESTIVAL_PROGRESS_KEYS) {
    if (key in progress) writeJson(festivalStorageKey(slug, key), progress[key]);
  }
}

export function uniqueValues(values) {
  return [...new Set(values)];
}

export function mergeFestivalProgress(local, remote) {
  if (!remote) return local ?? { ...EMPTY_PROGRESS };
  if (!local) return remote;

  const remoteRatings = remote.beerRatings ?? {};
  const localRatings = local.beerRatings ?? {};
  const ratings = { ...remoteRatings, ...localRatings };

  for (const id of new Set([...Object.keys(remoteRatings), ...Object.keys(localRatings)])) {
    const remoteValue = remoteRatings[id];
    const localValue = localRatings[id];
    if (typeof remoteValue === "number" && typeof localValue === "number") {
      ratings[id] = Math.max(remoteValue, localValue);
    } else {
      ratings[id] = localValue ?? remoteValue;
    }
  }

  return {
    sessionFilter: local.sessionFilter ?? remote.sessionFilter ?? "all",
    drunkBeers: uniqueValues([...(remote.drunkBeers ?? []), ...(local.drunkBeers ?? [])]),
    favoriteBeers: uniqueValues([...(remote.favoriteBeers ?? []), ...(local.favoriteBeers ?? [])]),
    hideDrunkBeers: local.hideDrunkBeers ?? remote.hideDrunkBeers ?? false,
    beerRatings: ratings,
    showOnlyUnrated: local.showOnlyUnrated ?? remote.showOnlyUnrated ?? false,
    achievedMilestones: uniqueValues([
      ...(remote.achievedMilestones ?? []),
      ...(local.achievedMilestones ?? []),
    ]).sort((a, b) => a - b),
  };
}

export function hasFestivalActivity(progress) {
  if (!progress) return false;
  return (
    (progress.drunkBeers?.length ?? 0) > 0 ||
    (progress.favoriteBeers?.length ?? 0) > 0 ||
    Object.values(progress.beerRatings ?? {}).some((value) => typeof value === "number" && value > 0)
  );
}

export function ratedCountFrom(ratings) {
  return Object.values(ratings ?? {}).filter((value) => typeof value === "number" && value > 0)
    .length;
}
