/** Shared text for the in-app "Sync with Untappd" guide. Keep in step with docs/untappd-sync.md. */

export function exportUrl(origin, slug) {
  const base = `${origin}/?tab=export`;
  return slug ? `${base}&festival=${encodeURIComponent(slug)}` : base;
}

/** Check-in comment: festival name with edition, e.g. "Aarhus Together 2026". */
export function festivalComment(festival) {
  if (!festival?.name) return null;
  const edition = festival.edition ? String(festival.edition) : "";
  return edition && !festival.name.includes(edition) ? `${festival.name} ${edition}` : festival.name;
}

export function syncAgentPrompt({ origin, slug, venue, comment }) {
  const url = exportUrl(origin, slug || "<festival-slug>");
  const commentText = comment ? `"${comment}"` : `"<festival name> <edition>" (e.g. "Aarhus Together 2026")`;
  return `You are my Beerfest Tracker → Untappd sync agent. Work only in your own browser, on my own accounts.

ONE-TIME SETUP
- Sign in to Beerfest Tracker (${origin}) with a magic link sent to my email. Ask me to forward the link to you. Never ask for a password.
- Sign in to untappd.com as me. I enter my Untappd login myself (or via my password manager). Never write it down, store it in notes, or log it.
- Create a sync log you keep between runs (a file or memory), keyed by "<festival slug>:<beerId>". For each entry store the rating you posted, the Untappd check-in URL and ID, and the time.

EVERY RUN (every 15–30 minutes during festival hours)
1. Open ${url}
   Wait for the element #ratings-export-json with data-status="ready" and parse its text as JSON.
   If you see a sign-in prompt instead, stop and tell me the Beerfest Tracker session expired.
2. Rating rule: a rating of 0 means check in WITHOUT a rating (Untappd's minimum is 0.25). Any other rating is rounded to the nearest 0.25 (0.25–5).
3. For each beer in festivals[].ratings where "rating" is not null:
   a. Key = "<slug>:<beerId>". If the key is NOT in the log:
      - Find the beer: always use the app's own link (untappdUrl) first. Only if untappdUrl is null, use untappdSearchUrl or search Untappd by brewery + beer name, and continue only on a confident match (same brewery and same beer; names may differ in apostrophes, accents or punctuation). If you are not sure, skip it and report it.
      - Before checking in, look at my recent Untappd activity to make sure it is not already checked in from this festival. If it is, add that check-in to the log instead of posting.
      - Check in with the rating from the rating rule.
      - Comment: ${commentText} on every check-in.
      - Location: ${venue ? `"${venue}"` : "the festival venue"} if Untappd offers it. The "Add your location" picker needs browser geolocation; if that is unavailable, skip the venue.
      - If any share toggles are present (Facebook, X/Twitter, Foursquare), turn them all off.
      - Add the key to the log with the rating, the check-in URL and ID, and the time.
   b. If the key IS in the log and the rating changed: never delete or re-post the check-in. The Untappd website cannot edit check-ins (its "…" menu only offers Delete). Record the new rating in the log as a pending edit and tell me, with the check-in URL, so I can edit it in the Untappd mobile app (new rating rounded to the nearest 0.25, or no rating if it became 0). Only if you have the Untappd mobile app or API available, edit the check-in yourself and update the log.
   c. If a logged check-in was posted without the festival comment: same as above. Do not delete or re-post; tell me (or edit it yourself only via the Untappd app/API).
4. Never check in the same beer twice. If a check-in might have failed, verify on Untappd before retrying.
5. Report briefly: new check-ins, pending edits for me (rating changes, missing comments, with check-in URLs), skipped beers (no confident match). Stay quiet if nothing changed.`;
}
