<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:f7b733,50:fc4a1a,100:8e2de2&height=220&section=header&text=Beerfest%20Tracker%20%F0%9F%8D%BA&fontSize=56&fontColor=ffffff&fontAlignY=38&desc=Check%20it.%20Star%20it.%20Rate%20it.%20%C2%B7%20Every%20fest.&descAlignY=60&descSize=20&animation=twinkling" width="100%" />

<a href="https://beerfest-tracker.vercel.app">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=24&pause=900&color=F7B733&center=true&vCenter=true&width=640&lines=Check+it.+Star+it.+Rate+it.;Every+fest.+Every+pour.;Your+ratings.+Your+passport.;Sk%C3%A5l!" alt="Typing banner" />
</a>

<br/>

<a href="https://beerfest-tracker.vercel.app"><img src="https://img.shields.io/badge/%F0%9F%8D%BA_OPEN_THE_APP-beerfest--tracker.vercel.app-fc4a1a?style=for-the-badge&labelColor=1a1a1a" alt="Open the app" /></a>

<br/>

<img src="https://img.shields.io/badge/multi--festival-ready-f7b733?style=flat-square&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/magic_link-optional-f7b733?style=flat-square&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/React-Vite-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/data-localStorage_%2B_optional_cloud-8e2de2?style=flat-square&labelColor=1a1a1a" />

**🔗 Live:** [beerfest-tracker.vercel.app](https://beerfest-tracker.vercel.app)

</div>

---

**Beerfest Tracker** is a multi-festival beer tracker. First stamp: **Raise the Bar** at Ridehuset, Aarhus, Friday 9 October 2026 (fri bar 17–21).

A React + Vite app for checking off beers, starring favorites, and rating pours in 0.25 steps. Works fully offline in `localStorage`. Optional magic-link login syncs ratings across devices.

## What’s in the glass

- Festival files under `src/festivals/` — add a JSON file and it shows up in the picker
- Raise the Bar 2026 is bundled as the first festival (275 beers / 50 breweries, session colors, No/Low)
- TBA entries kept as TBA
- Untappd search links on every named beer
- Untappd rating + rating count on 230 of 275 beers (beers without one show no Untappd link)
- Tap a beer for details (style, ABV, rating, quick actions)
- Filters: status, session, stand, style, ABV range, rating range, only-rated, plus sort by rating / ABV / name
- **Map** tab: schematic of the three stand areas with per-zone progress
- **Route** tab: build your own route (list-add icon on any beer, reorder, copy) or use the suggested must-try route by stand
- Dark neon UI with voxel-style 3D pixel art (mug, hop, can)
- Check-off, favorites, rating slider, search, and hide/unrated filters
- Per-festival achievements
- **Boards**: live leaderboards for everyone signed in at the festival — most and fewest check-ins, highest and lowest average ratings, plus ratings and stars. Same boards for beers, breweries, and styles
- Passport / history: festivals you’ve been to, plus an all-time hall of foam
- Progress stored under `beerFest.festivals.<slug>.*` (legacy `greenSession.*` keys are migrated on first load)

## Run locally

```bash
npm install
npm run dev
```

Opens at [http://127.0.0.1:43173](http://127.0.0.1:43173).

```bash
npm run build
npm run preview
```

## Add the next festival

Drop a file at `src/festivals/<slug>.json`. The app loads every valid JSON in that folder.

Or convert a CSV / JSON beer list:

```bash
npm run import-festival -- --slug autumn-fest-2027 --name "Autumn Fest" \
  --date 2027-09-12 --venue "Some Venue, City" path/to/beers.csv
```

CSV headers (case-insensitive): `brewery, location, stand, noLow, beer, style, abv, session, notes`

JSON can be a full festival object or `{ "breweries": [...] }` plus the CLI flags. Session tiers are optional — omit them, or pass `--no-sessions`.

Festival shape:

```json
{
  "slug": "raise-the-bar-2026",
  "name": "Raise the Bar",
  "date": "2026-10-09",
  "venue": "Ridehuset, Aarhus",
  "hours": "Fri bar 17–21",
  "sessions": [{ "id": "green", "label": "Green", "color": "#2e7d32" }],
  "breweries": []
}
```

## Magic-link login (optional)

Without env vars the app stays local-only and hides sign-in. Current deploys keep working until you add config.

To turn on sync:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication → Sign-in method → Email link (passwordless)**.
3. Add authorized domains:
   - `localhost`
   - `beerfest-tracker.vercel.app`
4. Create a **Firestore** database (production mode) and publish `firestore.rules` from this repo. Each person can read and write only `users/{theirUid}/**`. Festival leaderboards live at `festivals/{slug}/roster/{uid}`: any signed-in user can read them, and a person can write only their own roster doc (display name, check-ins, ratings, and stars — not their email).
5. Register a web app and copy the config into Vercel env vars:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

The Firebase web `apiKey` is public client config — it is meant to ship in the frontend. Access is enforced by Firestore rules (private ratings under `users/{theirUid}/**`; the shared board is readable by signed-in users and writable only by the person who checked in) and by HTTP-referrer restrictions on the key in Google Cloud / Firebase.

Locally, copy `.env.example` to `.env.local`. On first sign-in, device ratings merge into the account (union of check-offs / stars / milestones; highest rating wins).

## Deploy

Production is **Vercel** only: [beerfest-tracker.vercel.app](https://beerfest-tracker.vercel.app). The project is git-connected and auto-deploys `main`.

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:8e2de2,50:fc4a1a,100:f7b733&height=120&section=footer" width="100%" />

</div>
