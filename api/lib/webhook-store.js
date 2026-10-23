import { getAdminDb } from "./firebase-admin.js";
import { generateSigningSecret, signingSecretSuffix } from "./signature.js";

export const DELIVERY_LIMIT = 20;
export const TEST_LIMIT = 8;
export const RATE_WINDOW_MS = 60_000;

function publicDoc(uid, db) {
  return db.doc(`users/${uid}/integrations/webhook`);
}

function secretsDoc(uid, db) {
  return db.doc(`users/${uid}/integrations/webhookSecrets`);
}

export function sanitizeConfig(secrets, extras = {}) {
  const url = secrets?.url ? String(secrets.url) : "";
  let urlHost = null;
  try {
    urlHost = url ? new URL(url).hostname : null;
  } catch {
    urlHost = null;
  }
  return {
    enabled: Boolean(secrets?.enabled && url),
    hasUrl: Boolean(url),
    urlHost,
    headerName: secrets?.headerName || null,
    hasAuthValue: Boolean(secrets?.headerValue),
    hasSigningSecret: Boolean(secrets?.signingSecret),
    signingSecretSuffix: signingSecretSuffix(secrets?.signingSecret),
    ...extras,
  };
}

export function memoryWebhookStore(seed = new Map()) {
  const data = seed;
  return {
    async getSecrets(uid) {
      return data.get(uid)?.secrets ?? null;
    },
    async saveSecrets(uid, secrets) {
      const current = data.get(uid) ?? {};
      data.set(uid, { ...current, secrets: { ...secrets } });
    },
    async consumeRate(uid, { limit, windowMs = RATE_WINDOW_MS }) {
      const current = data.get(uid) ?? {};
      const now = Date.now();
      const start = current.rateWindowStart ?? 0;
      let count = current.rateCount ?? 0;
      const windowStart = now - start > windowMs ? now : start;
      if (windowStart === now) count = 0;
      if (count >= limit) return false;
      data.set(uid, { ...current, rateWindowStart: windowStart, rateCount: count + 1 });
      return true;
    },
  };
}

export function firestoreWebhookStore(env = process.env) {
  const db = getAdminDb(env);
  if (!db) return null;
  return {
    async getSecrets(uid) {
      const snap = await secretsDoc(uid, db).get();
      return snap.exists ? snap.data() : null;
    },
    async saveSecrets(uid, secrets) {
      const payload = {
        url: secrets.url ?? null,
        headerName: secrets.headerName ?? null,
        headerValue: secrets.headerValue ?? null,
        signingSecret: secrets.signingSecret ?? null,
        enabled: Boolean(secrets.enabled),
        updatedAt: new Date(),
      };
      await secretsDoc(uid, db).set(payload, { merge: true });
      await publicDoc(uid, db).set(sanitizeConfig(payload), { merge: true });
    },
    async consumeRate(uid, { limit, windowMs = RATE_WINDOW_MS }) {
      const ref = secretsDoc(uid, db);
      return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) return false;
        const now = Date.now();
        const start = Number(snap.get("rateWindowStart") ?? 0);
        let count = Number(snap.get("rateCount") ?? 0);
        const windowStart = now - start > windowMs ? now : start;
        if (windowStart === now) count = 0;
        if (count >= limit) return false;
        tx.update(ref, { rateWindowStart: windowStart, rateCount: count + 1 });
        return true;
      });
    },
  };
}

export function mergeSecrets(existing, patch) {
  const next = {
    url: existing?.url ?? null,
    headerName: existing?.headerName ?? null,
    headerValue: existing?.headerValue ?? null,
    signingSecret: existing?.signingSecret ?? null,
    enabled: existing?.enabled ?? false,
  };
  if (patch.url !== undefined) next.url = patch.url ? String(patch.url).trim() : null;
  if (patch.headerName !== undefined) {
    next.headerName = patch.headerName ? String(patch.headerName).trim() : null;
  }
  if (patch.headerValue !== undefined) {
    if (patch.headerValue === "" || patch.headerValue == null) {
      if (patch.clearAuthValue) next.headerValue = null;
    } else {
      next.headerValue = String(patch.headerValue);
    }
  }
  if (patch.enabled !== undefined) next.enabled = Boolean(patch.enabled);
  return next;
}

export function ensureSigningSecret(secrets) {
  if (secrets.signingSecret) {
    return { secrets, created: null };
  }
  const created = generateSigningSecret();
  return { secrets: { ...secrets, signingSecret: created }, created };
}
