import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

const blocked = new BlockList();
blocked.addSubnet("0.0.0.0", 8, "ipv4");
blocked.addSubnet("10.0.0.0", 8, "ipv4");
blocked.addSubnet("100.64.0.0", 10, "ipv4");
blocked.addSubnet("127.0.0.0", 8, "ipv4");
blocked.addSubnet("169.254.0.0", 16, "ipv4");
blocked.addSubnet("172.16.0.0", 12, "ipv4");
blocked.addSubnet("192.168.0.0", 16, "ipv4");
blocked.addSubnet("198.18.0.0", 15, "ipv4");
blocked.addAddress("::1", "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6");
blocked.addSubnet("fe80::", 10, "ipv6");

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
]);

export class UnsafeUrlError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

function hostnameOf(url) {
  return String(url.hostname ?? "")
    .replace(/^\[|\]$/g, "")
    .toLowerCase();
}

function ipv4FromDottedDecimal(host) {
  if (!/^\d+$/.test(host)) return null;
  const value = Number(host);
  if (!Number.isSafeInteger(value) || value < 0 || value > 0xffffffff) return null;
  return [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join(".");
}

export function isBlockedIp(ip) {
  if (!ip) return true;
  let value = String(ip).toLowerCase();
  if (value.startsWith("::ffff:")) value = value.slice(7);
  if (isIP(value) === 4) return blocked.check(value, "ipv4");
  if (isIP(value) === 6) return blocked.check(value, "ipv6");
  return true;
}

export function isBlockedHostname(hostname) {
  const host = String(hostname ?? "").toLowerCase();
  if (!host) return true;
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host.endsWith(".arpa")) return true;
  if (isIP(host) && isBlockedIp(host)) return true;
  const dotted = ipv4FromDottedDecimal(host);
  if (dotted && isBlockedIp(dotted)) return true;
  return false;
}

export function parseHttpsUrl(raw) {
  if (typeof raw !== "string" || raw.length > 2048) {
    throw new UnsafeUrlError("Webhook URL must be an https URL.");
  }
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new UnsafeUrlError("Webhook URL is not valid.");
  }
  if (url.protocol !== "https:") {
    throw new UnsafeUrlError("Webhook URL must use https.");
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("Webhook URL must not include credentials.");
  }
  if (url.port && url.port !== "443") {
    throw new UnsafeUrlError("Webhook URL must use the default https port.");
  }
  if (isBlockedHostname(hostnameOf(url))) {
    throw new UnsafeUrlError("Webhook URL host is not allowed.");
  }
  return url;
}

export async function assertSafeWebhookUrl(raw, options = {}) {
  const url = parseHttpsUrl(raw);
  const host = hostnameOf(url);
  if (isIP(host)) {
    if (isBlockedIp(host)) throw new UnsafeUrlError("Webhook URL host is not allowed.");
    return url;
  }
  const resolve = options.lookup ?? lookup;
  let records;
  try {
    records = await resolve(host, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUrlError("Webhook URL host could not be resolved.");
  }
  const addresses = Array.isArray(records) ? records : [records];
  if (!addresses.length) {
    throw new UnsafeUrlError("Webhook URL host could not be resolved.");
  }
  for (const record of addresses) {
    const address = record?.address ?? record;
    if (isBlockedIp(address)) {
      throw new UnsafeUrlError("Webhook URL resolves to a private address.");
    }
  }
  return url;
}
