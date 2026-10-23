import { json, readJsonBody } from "./http.js";
import { buildTestPayload } from "./payload.js";
import { generateSigningSecret } from "./signature.js";
import { UnsafeUrlError, assertSafeWebhookUrl } from "./ssrf.js";
import { verifyFirebaseIdToken } from "./verify-firebase-id-token.js";
import { deliverToWebhook, requireCaller } from "./rating-hook.js";
import {
  TEST_LIMIT,
  ensureSigningSecret,
  firestoreWebhookStore,
  mergeSecrets,
  sanitizeConfig,
} from "./webhook-store.js";

function storeOr503(res, deps, env) {
  const store = deps.store ?? firestoreWebhookStore(env);
  if (!store) {
    json(res, 503, {
      error:
        "Webhook storage is not configured. Set FIREBASE_SERVICE_ACCOUNT on Vercel (service account JSON).",
    });
    return null;
  }
  return store;
}

export async function handleWebhookSettings(req, res, deps = {}) {
  const env = deps.env ?? process.env;
  const verifyIdToken = deps.verifyIdToken ?? verifyFirebaseIdToken;

  if (!["GET", "PUT", "POST"].includes(req.method)) {
    res.setHeader?.("Allow", "GET, PUT, POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const caller = await requireCaller(req, res, { ...deps, env, verifyIdToken });
  if (!caller) return res;

  const store = storeOr503(res, deps, env);
  if (!store) return res;

  if (req.method === "GET") {
    const secrets = await store.getSecrets(caller.uid);
    return json(res, 200, sanitizeConfig(secrets));
  }

  const body = readJsonBody(req);
  if (body == null) {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  if (req.method === "POST" && body.action === "test") {
    return sendTest(res, caller, body, store, deps);
  }
  if (req.method === "POST" && (body.action === "rotate-secret" || body.action === "rotate")) {
    return rotateSecret(res, caller, store);
  }
  if (req.method === "POST") {
    return json(res, 400, { error: "Unknown action" });
  }

  return saveSettings(res, caller, body, store, deps);
}

async function saveSettings(res, caller, body, store, deps) {
  const existing = (await store.getSecrets(caller.uid)) ?? {};
  const next = mergeSecrets(existing, {
    url: body.url,
    headerName: body.headerName,
    headerValue: body.headerValue,
    clearAuthValue: body.clearAuthValue,
    enabled: body.enabled,
  });

  if (next.headerName && !/^[-A-Za-z0-9]{1,64}$/.test(next.headerName)) {
    return json(res, 400, { error: "Invalid auth header name." });
  }
  if (next.enabled && !next.url) {
    return json(res, 400, { error: "Add an https webhook URL before enabling." });
  }
  if (next.url) {
    try {
      await assertSafeWebhookUrl(next.url, { lookup: deps.lookup });
    } catch (error) {
      const message = error instanceof UnsafeUrlError ? error.message : "Webhook URL is not allowed.";
      return json(res, 400, { error: message });
    }
  }

  const { secrets, created } = ensureSigningSecret(next);
  await store.saveSecrets(caller.uid, secrets);
  return json(res, 200, {
    ...sanitizeConfig(secrets),
    signingSecret: created,
  });
}

async function rotateSecret(res, caller, store) {
  const existing = await store.getSecrets(caller.uid);
  if (!existing?.url) {
    return json(res, 400, { error: "Save a webhook URL before creating a signing secret." });
  }
  const signingSecret = generateSigningSecret();
  const secrets = { ...existing, signingSecret };
  await store.saveSecrets(caller.uid, secrets);
  return json(res, 200, { ...sanitizeConfig(secrets), signingSecret });
}

async function sendTest(res, caller, body, store, deps) {
  const secrets = await store.getSecrets(caller.uid);
  if (!secrets?.enabled || !secrets.url || !secrets.signingSecret) {
    return json(res, 400, { error: "Enable a webhook URL first." });
  }
  const allowed = await store.consumeRate(caller.uid, { limit: deps.testLimit ?? TEST_LIMIT });
  if (!allowed) {
    return json(res, 429, { error: "Too many test events" });
  }
  const payload = buildTestPayload({
    festival: body.festival,
    userDisplayName: body.userDisplayName,
  });
  try {
    const { response } = await deliverToWebhook(secrets, payload, deps);
    if (!response.ok) {
      return json(res, 502, { error: "Webhook rejected the test event" });
    }
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      return json(res, 400, { error: error.message });
    }
    return json(res, 502, { error: "Could not reach webhook" });
  }
  return json(res, 200, { ok: true, forwarded: true, event: "test" });
}
