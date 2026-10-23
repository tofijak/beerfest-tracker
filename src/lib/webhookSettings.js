async function authFetch(user, url, init = {}) {
  const token = await user.getIdToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function loadWebhookSettings(user) {
  return authFetch(user, "/api/webhook-settings");
}

export async function saveWebhookSettings(user, fields) {
  const body = {
    enabled: fields.enabled,
    headerName: fields.headerName,
  };
  if (fields.url) body.url = fields.url;
  if (fields.headerValue) body.headerValue = fields.headerValue;
  if (fields.clearAuthValue) body.clearAuthValue = true;
  return authFetch(user, "/api/webhook-settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function sendWebhookTest(user, { festival, userDisplayName }) {
  return authFetch(user, "/api/webhook-settings", {
    method: "POST",
    body: JSON.stringify({
      action: "test",
      festival: festival
        ? { slug: festival.slug, name: festival.name, venue: festival.venue ?? null }
        : undefined,
      userDisplayName,
    }),
  });
}

export async function rotateWebhookSecret(user) {
  return authFetch(user, "/api/webhook-settings", {
    method: "POST",
    body: JSON.stringify({ action: "rotate-secret" }),
  });
}
