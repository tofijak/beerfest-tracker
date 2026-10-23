import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  buildRatingPayload,
  resetRatingHookQueue,
  scheduleRatingHook,
} from "./ratingHook.js";

afterEach(() => {
  resetRatingHookQueue();
});

const festival = {
  slug: "raise-the-bar-2026",
  name: "Raise the Bar",
  venue: "Ridehuset, Aarhus",
};

const entry = {
  beer: {
    id: 102,
    name: "Zenne d’Auge",
    style: "Calvados BA lambic",
    abv: 8.5,
    session: "green",
    untappdUrl: "https://untappd.com/b/example/1",
    untappd: { url: "https://untappd.com/b/example/1" },
  },
  brewery: { name: "3 Fonteinen" },
};

test("buildRatingPayload is versioned rating.created / rating.updated", () => {
  const first = buildRatingPayload({
    festival,
    entry,
    beerId: 102,
    rating: 4.25,
    previousRating: 0,
    displayName: "Alex",
    timestamp: "2026-10-23T10:00:00.000Z",
  });
  assert.equal(first.event, "rating.created");
  assert.equal(first.version, 1);
  assert.equal(first.note, null);
  assert.deepEqual(first.festival, {
    slug: "raise-the-bar-2026",
    name: "Raise the Bar",
    venue: "Ridehuset, Aarhus",
  });

  const changed = buildRatingPayload({
    festival,
    entry,
    beerId: 102,
    rating: 4.5,
    previousRating: 4.25,
    displayName: "Alex",
    timestamp: "2026-10-23T10:00:00.000Z",
  });
  assert.equal(changed.event, "rating.updated");
  assert.equal(changed.userDisplayName, "Alex");
  assert.equal(changed.beer.brewery, "3 Fonteinen");
  assert.equal(changed.beer.untappdUrl, "https://untappd.com/b/example/1");
});

test("scheduleRatingHook ignores signed-out users and zero ratings", async () => {
  const calls = [];
  const fetchImpl = async (...args) => {
    calls.push(args);
    return new Response("ok");
  };
  scheduleRatingHook(
    { user: null, festival, entry, beerId: 102, rating: 4, previousRating: 0 },
    { fetchImpl, debounceMs: 0 },
  );
  scheduleRatingHook(
    {
      user: { getIdToken: async () => "tok" },
      festival,
      entry,
      beerId: 102,
      rating: 0,
      previousRating: 0,
    },
    { fetchImpl, debounceMs: 0 },
  );
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(calls.length, 0);
});

test("scheduleRatingHook coalesces slider drags", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return new Response("ok");
  };
  const user = { getIdToken: async () => "id-token" };

  scheduleRatingHook(
    { user, festival, entry, beerId: 102, rating: 3.25, previousRating: 0, displayName: "Alex" },
    { fetchImpl, debounceMs: 40 },
  );
  scheduleRatingHook(
    { user, festival, entry, beerId: 102, rating: 4.25, previousRating: 3.25, displayName: "Alex" },
    { fetchImpl, debounceMs: 40 },
  );

  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(calls.length, 1);
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.event, "rating.created");
  assert.equal(body.rating, 4.25);
  assert.equal(calls[0].init.headers.Authorization, "Bearer id-token");
});
