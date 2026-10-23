export const PAYLOAD_VERSION = 1;

const DEBOUNCE_MS = 700;
const pending = new Map();

export function ratingHookKey(festivalSlug, beerId) {
  return `${festivalSlug ?? ""}:${beerId}`;
}

export function buildRatingPayload({
  festival,
  entry,
  beerId,
  rating,
  previousRating,
  note,
  timestamp,
  displayName,
}) {
  const beer = entry?.beer;
  const brewery = entry?.brewery;
  const previous = typeof previousRating === "number" && previousRating > 0 ? previousRating : 0;
  return {
    version: PAYLOAD_VERSION,
    event: previous > 0 ? "rating.updated" : "rating.created",
    userDisplayName: displayName || null,
    festival: {
      slug: festival?.slug ?? "",
      name: festival?.name ?? null,
      venue: festival?.venue ?? null,
    },
    beer: {
      id: beerId,
      name: beer?.name ?? null,
      brewery: brewery?.name ?? null,
      style: beer?.style ?? null,
      abv: typeof beer?.abv === "number" ? beer.abv : null,
      session: beer?.session ?? null,
      untappdUrl: beer?.untappd?.url ?? null,
    },
    rating,
    note: note == null || note === "" ? null : String(note),
    timestamp: timestamp ?? new Date().toISOString(),
  };
}

export async function forwardRatingHook({
  user,
  payload,
  fetchImpl = fetch,
  endpoint = "/api/rating-hook",
}) {
  try {
    if (!user?.getIdToken) return;
    const token = await user.getIdToken();
    await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Rating hook skipped:", error);
  }
}

/**
 * Fire-and-forget after a committed rating. Coalesces slider drags per beer.
 * Never throws; signed-out callers are ignored. The server no-ops if the
 * user has not enabled a webhook.
 */
export function scheduleRatingHook(
  { user, festival, entry, beerId, rating, previousRating, note, displayName },
  options = {},
) {
  if (!user) return;
  if (typeof rating !== "number" || !(rating > 0)) return;

  const key = ratingHookKey(festival?.slug, beerId);
  const existing = pending.get(key);
  const originalPrevious = existing ? existing.previousRating : previousRating;
  if (existing?.timer) clearTimeout(existing.timer);

  const send = () => {
    pending.delete(key);
    if (rating === originalPrevious) return;
    void forwardRatingHook({
      user,
      payload: buildRatingPayload({
        festival,
        entry,
        beerId,
        rating,
        previousRating: originalPrevious,
        note,
        displayName,
      }),
      fetchImpl: options.fetchImpl,
      endpoint: options.endpoint,
    });
  };

  const wait = options.debounceMs ?? DEBOUNCE_MS;
  if (wait <= 0) {
    send();
    return;
  }

  pending.set(key, {
    previousRating: originalPrevious,
    timer: setTimeout(send, wait),
  });
}

export function resetRatingHookQueue() {
  for (const item of pending.values()) {
    if (item?.timer) clearTimeout(item.timer);
  }
  pending.clear();
}
