import { handleRatingHook } from "./lib/rating-hook.js";

export default async function handler(req, res) {
  return handleRatingHook(req, res);
}
