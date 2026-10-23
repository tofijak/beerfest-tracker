import { decodeProtectedHeader, importX509, jwtVerify } from "jose";

const CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let certCache = { certs: null, expiresAt: 0 };

function cacheMaxAgeMs(cacheControl) {
  const seconds = Number(/max-age=(\d+)/i.exec(cacheControl ?? "")?.[1] ?? 3600);
  return Math.max(60, seconds) * 1000;
}

export async function fetchSecuretokenCerts(fetchImpl = fetch) {
  if (certCache.certs && Date.now() < certCache.expiresAt) return certCache.certs;
  const response = await fetchImpl(CERTS_URL);
  if (!response.ok) {
    throw new Error(`Could not load Firebase signing keys (${response.status}).`);
  }
  const certs = await response.json();
  certCache = {
    certs,
    expiresAt: Date.now() + cacheMaxAgeMs(response.headers.get("cache-control")),
  };
  return certs;
}

export function resetSecuretokenCertCache() {
  certCache = { certs: null, expiresAt: 0 };
}

export function firebaseProjectId(env = process.env) {
  return String(env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || "").trim();
}

/**
 * Verify a Firebase Auth ID token against Google's securetoken X.509 certs.
 * No service-account JSON required — only the Firebase project id.
 */
export async function verifyFirebaseIdToken(token, options = {}) {
  const env = options.env ?? process.env;
  const projectId = options.projectId || firebaseProjectId(env);
  if (!projectId) {
    throw new Error("Firebase project id is not configured.");
  }
  if (!token || typeof token !== "string") {
    throw new Error("Missing ID token.");
  }

  const header = decodeProtectedHeader(token);
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Invalid ID token header.");
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const certs = options.certs ?? (await fetchSecuretokenCerts(fetchImpl));
  const pem = certs[header.kid];
  if (!pem) {
    throw new Error("Unknown ID token signing key.");
  }

  const key = await importX509(pem, "RS256");
  const { payload } = await jwtVerify(token, key, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("ID token is missing a subject.");
  }
  if (typeof payload.auth_time === "number" && payload.auth_time * 1000 > Date.now() + 5000) {
    throw new Error("ID token auth_time is in the future.");
  }

  return payload;
}
