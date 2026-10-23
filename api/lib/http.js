export function header(req, name) {
  const headers = req.headers ?? {};
  const direct = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(direct)) return direct[0];
  return direct;
}

export function bearerToken(authorization) {
  const value = String(authorization ?? "").trim();
  if (!value) return "";
  const match = /^bearer\s+(.+)$/i.exec(value);
  return (match ? match[1] : value).trim();
}

export function readJsonBody(req) {
  try {
    if (req.body == null || req.body === "") return {};
    if (typeof req.body === "string") return JSON.parse(req.body);
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8"));
    return req.body;
  } catch {
    return null;
  }
}

export function json(res, status, body) {
  if (typeof res.status === "function") {
    return res.status(status).json(body);
  }
  res.statusCode = status;
  res.setHeader?.("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
  return res;
}

export function empty(res, status) {
  if (typeof res.status === "function") {
    res.status(status);
    if (typeof res.end === "function") res.end();
    return res;
  }
  res.statusCode = status;
  res.end();
  return res;
}

export function callerFromToken(payload) {
  return {
    uid: String(payload?.sub ?? payload?.uid ?? ""),
    email: payload?.email ? String(payload.email) : null,
  };
}
