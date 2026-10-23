import { handleWebhookSettings } from "./lib/webhook-settings.js";

export default async function handler(req, res) {
  return handleWebhookSettings(req, res);
}
