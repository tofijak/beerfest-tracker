export const PAYLOAD_VERSION = 1;

const EVENTS = new Set(["rating.created", "rating.updated", "test"]);

function text(value, fallback = null) {
  if (value == null || value === "") return fallback;
  return String(value);
}

function finiteNumber(value) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

export function normalizeEvent(event, previousRating) {
  if (EVENTS.has(event)) return event;
  if (event === "rated" || event === "rating-changed") {
    return event === "rating-changed" ? "rating.updated" : "rating.created";
  }
  const previous = typeof previousRating === "number" && previousRating > 0;
  return previous ? "rating.updated" : "rating.created";
}

export function buildDeliveryPayload(input, now = new Date()) {
  const event = normalizeEvent(input?.event, input?.previousRating);
  const beer = input?.beer ?? {};
  const festival = input?.festival ?? {};
  return {
    version: PAYLOAD_VERSION,
    event,
    userDisplayName: text(input?.userDisplayName),
    festival: {
      slug: text(festival.slug ?? input?.festivalSlug, ""),
      name: text(festival.name ?? input?.festivalName),
      venue: text(festival.venue ?? input?.venue),
    },
    beer: {
      id: beer.id ?? input?.beerId ?? null,
      name: text(beer.name ?? input?.beerName),
      brewery: text(beer.brewery ?? input?.brewery),
      style: text(beer.style ?? input?.style),
      abv: finiteNumber(beer.abv ?? input?.abv),
      session: text(beer.session ?? input?.session),
      untappdUrl: text(beer.untappdUrl ?? input?.untappdUrl),
    },
    rating: finiteNumber(input?.rating),
    note: text(input?.note),
    timestamp:
      typeof input?.timestamp === "string" && input.timestamp
        ? input.timestamp
        : now.toISOString(),
  };
}

export function buildTestPayload({ festival, userDisplayName } = {}, now = new Date()) {
  return buildDeliveryPayload(
    {
      event: "test",
      userDisplayName,
      festival: {
        slug: festival?.slug ?? "test",
        name: festival?.name ?? "Beerfest Tracker",
        venue: festival?.venue ?? null,
      },
      beer: {
        id: "test",
        name: "Webhook test pour",
        brewery: "Beerfest Tracker",
        style: "Integration test",
        abv: null,
        session: null,
        untappdUrl: null,
      },
      rating: 5,
      note: "Test event from Beerfest Tracker. Do not check this in on Untappd.",
      timestamp: now.toISOString(),
    },
    now,
  );
}

export function assertRatingPayload(payload) {
  if (payload.event === "test") return;
  if (!payload.festival?.slug || payload.beer?.id == null || payload.rating == null) {
    throw new Error("Missing festival, beer, or rating.");
  }
}
