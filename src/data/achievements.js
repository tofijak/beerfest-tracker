const EMPTY_SET = Object.freeze({ metric: "rated", items: [] });

const modules = import.meta.glob("./achievement-sets/*.js", { eager: true, import: "default" });

function normalizeSet(raw) {
  if (!raw || !Array.isArray(raw.items)) return EMPTY_SET;
  return {
    metric: raw.metric === "tasted" ? "tasted" : "rated",
    items: raw.items,
  };
}

/**
 * Achievements are per festival. A festival JSON may set `achievementSet` to a
 * file stem under `src/data/achievement-sets/` (for example `aarhus-together-2026`).
 * If that is omitted, the festival slug is used. A future festival with no matching
 * file gets an empty set — no trophy tab — rather than another festival's photos.
 */
export function getAchievementSet(festival) {
  const key = festival?.achievementSet || festival?.slug;
  if (!key) return EMPTY_SET;
  return normalizeSet(modules[`./achievement-sets/${key}.js`]);
}
