import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SIGNATURE_HEADER = "X-Beerfest-Signature";
export const TIMESTAMP_HEADER = "X-Beerfest-Timestamp";
export const SIGNATURE_MAX_AGE_SEC = 300;

export function generateSigningSecret() {
  return `bfwh_${randomBytes(32).toString("base64url")}`;
}

export function signingSecretSuffix(secret) {
  const value = String(secret ?? "");
  return value.length >= 4 ? value.slice(-4) : null;
}

/** HMAC-SHA256 of `${unixSeconds}.${rawBody}`, hex-encoded. */
export function signPayload(secret, timestamp, rawBody) {
  const payload = `${timestamp}.${rawBody}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function signatureHeaders(secret, rawBody, now = new Date()) {
  const timestamp = String(Math.floor(now.getTime() / 1000));
  const signature = signPayload(secret, timestamp, rawBody);
  return {
    [TIMESTAMP_HEADER]: timestamp,
    [SIGNATURE_HEADER]: `sha256=${signature}`,
  };
}

export function verifySignature(secret, rawBody, timestamp, signatureHeader, now = new Date()) {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Math.floor(now.getTime() / 1000) - ts) > SIGNATURE_MAX_AGE_SEC) return false;
  const expected = `sha256=${signPayload(secret, String(ts), rawBody)}`;
  const given = String(signatureHeader ?? "");
  if (expected.length !== given.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}

const FORBIDDEN_HEADERS = new Set([
  "host",
  "content-length",
  "content-type",
  "transfer-encoding",
  "connection",
  "authorization",
  SIGNATURE_HEADER.toLowerCase(),
  TIMESTAMP_HEADER.toLowerCase(),
]);

export function normalizeAuthHeader(name, value) {
  const headerName = String(name ?? "").trim();
  const headerValue = String(value ?? "").trim();
  if (!headerName || !headerValue) return {};
  if (!/^[-A-Za-z0-9]+$/.test(headerName) || headerName.length > 64 || headerValue.length > 1024) {
    throw new Error("Invalid auth header.");
  }
  const lower = headerName.toLowerCase();
  if (lower !== "authorization" && FORBIDDEN_HEADERS.has(lower)) {
    throw new Error("That auth header name is reserved.");
  }
  if (lower === "authorization" && !/^\s*bearer\s+/i.test(headerValue)) {
    return { Authorization: `Bearer ${headerValue}` };
  }
  return { [headerName]: headerValue };
}
