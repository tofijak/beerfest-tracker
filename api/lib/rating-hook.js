import { bearerToken, callerFromToken, empty, header, json, readJsonBody } from "./http.js";
import { assertRatingPayload, buildDeliveryPayload } from "./payload.js";
import { normalizeAuthHeader, signatureHeaders } from "./signature.js";
import { UnsafeUrlError, assertSafeWebhookUrl } from "./ssrf.js";
import { firebaseProjectId, verifyFirebaseIdToken } from "./verify-firebase-id-token.js";
import {
  DELIVERY_LIMIT,
  firestoreWebhookStore,
  sanitizeConfig,
} from "./webhook-store.js";

export async function requireCaller(req, res, deps) {
  const env = deps.env ?? process.env;
  const token = bearerToken(header(req, "authorization"));
  if (!token) {
    json(res, 401, { error: "Missing bearer token" });
    return null;
  }
  const projectId = firebaseProjectId(env);
  if (!projectId) {
    json(res, 503, { error: "Firebase project id is not configured" });
    return null;
  }
  try {
    const payload = await deps.verifyIdToken(token, {
      env,
      projectId,
      fetchImpl: deps.fetchImpl ?? fetch,
    });
    const caller = callerFromToken(payload);
    if (!caller.uid) {
      json(res, 401, { error: "Invalid token" });
      return null;
    }
    return caller;
  } catch {
    json(res, 401, { error: "Invalid token" });
    return null;
  }
}

export async function deliverToWebhook(secrets, payload, deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  await assertSafeWebhookUrl(secrets.url, { lookup: deps.lookup });
  const rawBody = JSON.stringify(payload);
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "BeerfestTracker-Webhook/1",
    ...signatureHeaders(secrets.signingSecret, rawBody, deps.now),
    ...normalizeAuthHeader(secrets.headerName, secrets.headerValue),
  };
  const response = await fetchImpl(secrets.url, {
    method: "POST",
    headers,
    body: rawBody,
    redirect: "error",
    signal: deps.signal ?? AbortSignal.timeout(5000),
  });
  return { response, rawBody, headers };
}

export async function handleRatingHook(req, res, deps = {}) {
  const env = deps.env ?? process.env;
  const verifyIdToken = deps.verifyIdToken ?? verifyFirebaseIdToken;
  const store = deps.store ?? firestoreWebhookStore(env);

  if (req.method !== "POST") {
    res.setHeader?.("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const caller = await requireCaller(req, res, { ...deps, env, verifyIdToken });
  if (!caller) return res;

  if (!store) {
    return empty(res, 204);
  }

  const secrets = await store.getSecrets(caller.uid);
  if (!secrets?.enabled || !secrets.url || !secrets.signingSecret) {
    return empty(res, 204);
  }

  const body = readJsonBody(req);
  if (body == null) {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  let payload;
  try {
    payload = buildDeliveryPayload({
      ...body,
      userDisplayName: body.userDisplayName,
    });
    assertRatingPayload(payload);
  } catch {
    return json(res, 400, { error: "Missing festival, beer, or rating" });
  }

  const allowed = await store.consumeRate(caller.uid, { limit: deps.deliveryLimit ?? DELIVERY_LIMIT });
  if (!allowed) {
    return json(res, 429, { error: "Too many webhook deliveries" });
  }

  try {
    const { response } = await deliverToWebhook(secrets, payload, deps);
    if (!response.ok) {
      return json(res, 502, { error: "Webhook rejected the rating" });
    }
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      return json(res, 400, { error: error.message });
    }
    return json(res, 502, { error: "Could not reach webhook" });
  }

  return json(res, 200, { ok: true, forwarded: true, config: sanitizeConfig(secrets) });
}
