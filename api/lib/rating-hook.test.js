import assert from "node:assert/strict";
import http from "node:http";
import { after, before, test } from "node:test";
import { createHmac } from "node:crypto";
import { handleRatingHook } from "./rating-hook.js";
import { handleWebhookSettings } from "./webhook-settings.js";
import { verifySignature } from "./signature.js";
import { assertSafeWebhookUrl, UnsafeUrlError } from "./ssrf.js";
import { memoryWebhookStore } from "./webhook-store.js";
import { buildDeliveryPayload, PAYLOAD_VERSION } from "./payload.js";

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end(data) {
      if (data !== undefined) this.body = data;
      return this;
    },
  };
}

function mockReq({ method = "POST", headers = {}, body = {} } = {}) {
  return { method, headers, body };
}

const env = { VITE_FIREBASE_PROJECT_ID: "beerfest-test" };
const caller = { email: "owner@example.com", sub: "uid-owner" };
const verifyOk = async () => caller;
const verifyFail = async () => {
  throw new Error("bad token");
};

const ratingBody = {
  event: "rating.created",
  userDisplayName: "Alex",
  festival: { slug: "raise-the-bar-2026", name: "Raise the Bar", venue: "Ridehuset, Aarhus" },
  beer: {
    id: 102,
    name: "Zenne d’Auge",
    brewery: "3 Fonteinen",
    style: "Calvados BA lambic",
    abv: 8.5,
    session: "green",
    untappdUrl: "https://untappd.com/b/example/1",
  },
  rating: 4.25,
  note: null,
  timestamp: "2026-10-23T10:00:00.000Z",
};

function publicLookup() {
  return [{ address: "8.8.8.8", family: 4 }];
}

test("payload version and event names", () => {
  const created = buildDeliveryPayload({ ...ratingBody, event: "rated" });
  assert.equal(created.version, PAYLOAD_VERSION);
  assert.equal(created.event, "rating.created");
  const updated = buildDeliveryPayload({ ...ratingBody, event: "rating.updated" });
  assert.equal(updated.event, "rating.updated");
});

test("absent token is 401", async () => {
  const res = mockRes();
  await handleRatingHook(mockReq({ body: ratingBody }), res, {
    env,
    store: memoryWebhookStore(),
    verifyIdToken: verifyOk,
  });
  assert.equal(res.statusCode, 401);
});

test("invalid token is 401", async () => {
  const res = mockRes();
  await handleRatingHook(mockReq({ headers: { authorization: "Bearer nope" }, body: ratingBody }), res, {
    env,
    store: memoryWebhookStore(),
    verifyIdToken: verifyFail,
  });
  assert.equal(res.statusCode, 401);
});

test("disabled config is a no-op 204", async () => {
  const store = memoryWebhookStore();
  await store.saveSecrets("uid-owner", {
    enabled: false,
    url: "https://hooks.example.com/routine",
    signingSecret: "bfwh_secret",
  });
  let forwarded = 0;
  const res = mockRes();
  await handleRatingHook(mockReq({ headers: { authorization: "Bearer tok" }, body: ratingBody }), res, {
    env,
    store,
    verifyIdToken: verifyOk,
    fetchImpl: async () => {
      forwarded += 1;
      return new Response("ok");
    },
  });
  assert.equal(res.statusCode, 204);
  assert.equal(forwarded, 0);
});

test("SSRF: http, localhost, loopback, and private DNS are rejected", async () => {
  await assert.rejects(() => assertSafeWebhookUrl("http://example.com/hook"), UnsafeUrlError);
  await assert.rejects(() => assertSafeWebhookUrl("https://localhost/hook"), UnsafeUrlError);
  await assert.rejects(() => assertSafeWebhookUrl("https://127.0.0.1/hook"), UnsafeUrlError);
  await assert.rejects(() => assertSafeWebhookUrl("https://10.0.0.4/hook"), UnsafeUrlError);
  await assert.rejects(() => assertSafeWebhookUrl("https://169.254.169.254/latest"), UnsafeUrlError);
  await assert.rejects(() => assertSafeWebhookUrl("https://[::1]/hook"), UnsafeUrlError);
  await assert.rejects(
    () =>
      assertSafeWebhookUrl("https://evil.example/hook", {
        lookup: async () => [{ address: "127.0.0.1", family: 4 }],
      }),
    UnsafeUrlError,
  );
  const url = await assertSafeWebhookUrl("https://hooks.example.com/routine", { lookup: publicLookup });
  assert.equal(url.hostname, "hooks.example.com");
});

test("saving a private URL is rejected", async () => {
  const res = mockRes();
  await handleWebhookSettings(
    mockReq({
      method: "PUT",
      headers: { authorization: "Bearer tok" },
      body: { url: "https://127.0.0.1/hook", enabled: true },
    }),
    res,
    { env, store: memoryWebhookStore(), verifyIdToken: verifyOk },
  );
  assert.equal(res.statusCode, 400);
});

let receiver;
let receiverUrl = "";
let received = [];

before(async () => {
  receiver = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      received.push({
        method: req.method,
        headers: req.headers,
        raw: Buffer.concat(chunks).toString("utf8"),
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
  });
  await new Promise((resolve) => receiver.listen(0, "127.0.0.1", resolve));
  receiverUrl = `http://127.0.0.1:${receiver.address().port}/routine`;
});

after(async () => {
  if (receiver) await new Promise((resolve) => receiver.close(resolve));
});

test("delivery is signed and verifiable, with custom auth header", async () => {
  received = [];
  const store = memoryWebhookStore();
  const signingSecret = "bfwh_test_signing_secret";
  await store.saveSecrets("uid-owner", {
    enabled: true,
    url: "https://hooks.example.com/routine",
    headerName: "Authorization",
    headerValue: "hook-secret",
    signingSecret,
  });
  const fetchImpl = async (url, init) => {
    assert.equal(url, "https://hooks.example.com/routine");
    const posted = await fetch(receiverUrl, init);
    return posted;
  };
  const delivered = mockRes();
  await handleRatingHook(
    mockReq({ headers: { authorization: "Bearer tok" }, body: ratingBody }),
    delivered,
    { env, store, verifyIdToken: verifyOk, fetchImpl, lookup: publicLookup },
  );
  assert.equal(delivered.statusCode, 200);
  assert.equal(received.length, 1);
  const raw = received[0].raw;
  const body = JSON.parse(raw);
  assert.equal(body.version, 1);
  assert.equal(body.event, "rating.created");
  assert.equal(body.userDisplayName, "Alex");
  assert.equal(body.festival.slug, "raise-the-bar-2026");
  assert.equal(body.beer.name, "Zenne d’Auge");
  assert.equal(body.rating, 4.25);
  assert.equal(received[0].headers.authorization, "Bearer hook-secret");
  const timestamp = received[0].headers["x-beerfest-timestamp"];
  const signature = received[0].headers["x-beerfest-signature"];
  assert.match(signature, /^sha256=[0-9a-f]{64}$/);
  assert.equal(verifySignature(signingSecret, raw, timestamp, signature), true);
  const expected = `sha256=${createHmac("sha256", signingSecret).update(`${timestamp}.${raw}`).digest("hex")}`;
  assert.equal(signature, expected);
});

test("test event is signed as event=test", async () => {
  received = [];
  const store = memoryWebhookStore();
  const signingSecret = "bfwh_test_signing_secret";
  await store.saveSecrets("uid-owner", {
    enabled: true,
    url: "https://hooks.example.com/routine",
    signingSecret,
  });
  const fetchImpl = async (_url, init) => fetch(receiverUrl, init);
  const res = mockRes();
  await handleWebhookSettings(
    mockReq({
      method: "POST",
      headers: { authorization: "Bearer tok" },
      body: { action: "test", festival: ratingBody.festival, userDisplayName: "Alex" },
    }),
    res,
    { env, store, verifyIdToken: verifyOk, fetchImpl, lookup: publicLookup },
  );
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(received[0].raw);
  assert.equal(body.event, "test");
  assert.equal(body.version, 1);
  assert.equal(
    verifySignature(
      signingSecret,
      received[0].raw,
      received[0].headers["x-beerfest-timestamp"],
      received[0].headers["x-beerfest-signature"],
    ),
    true,
  );
});

test("first save returns a signing secret once; GET never does", async () => {
  const store = memoryWebhookStore();
  const saved = mockRes();
  await handleWebhookSettings(
    mockReq({
      method: "PUT",
      headers: { authorization: "Bearer tok" },
      body: { url: "https://hooks.example.com/routine", enabled: true, headerName: "Authorization" },
    }),
    saved,
    { env, store, verifyIdToken: verifyOk, lookup: publicLookup },
  );
  assert.equal(saved.statusCode, 200);
  assert.match(saved.body.signingSecret, /^bfwh_/);
  assert.equal(saved.body.urlHost, "hooks.example.com");
  assert.equal(saved.body.hasUrl, true);

  const loaded = mockRes();
  await handleWebhookSettings(mockReq({ method: "GET", headers: { authorization: "Bearer tok" } }), loaded, {
    env,
    store,
    verifyIdToken: verifyOk,
  });
  assert.equal(loaded.statusCode, 200);
  assert.equal(loaded.body.signingSecret, undefined);
  assert.equal(loaded.body.hasSigningSecret, true);
});
