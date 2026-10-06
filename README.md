<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:f7b733,50:fc4a1a,100:8e2de2&height=220&section=header&text=Raise%20the%20Bar%20%F0%9F%8D%BA&fontSize=64&fontColor=ffffff&fontAlignY=38&desc=Beer%20Fest%20Tracker%20%C2%B7%20Ridehuset%20Aarhus%20%C2%B7%209%20Oct%202026&descAlignY=60&descSize=20&animation=twinkling" width="100%" />

<a href="https://raise-the-bar-rating.vercel.app">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=24&pause=900&color=F7B733&center=true&vCenter=true&width=640&lines=275+beers.+50+breweries.+4+hours.;Fri+bar+17%E2%80%9321+%F0%9F%8D%BB;Check+it.+Star+it.+Rate+it.;Your+fests.+Your+ratings.+Sk%C3%A5l!" alt="Typing banner" />
</a>

<br/>

<a href="https://raise-the-bar-rating.vercel.app"><img src="https://img.shields.io/badge/%F0%9F%8D%BA_OPEN_THE_APP-raise--the--bar--rating.vercel.app-fc4a1a?style=for-the-badge&labelColor=1a1a1a" alt="Open the app" /></a>

<br/>

<img src="https://img.shields.io/badge/beers-275-f7b733?style=flat-square&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/breweries-50-f7b733?style=flat-square&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/fri_bar-17%E2%80%9321-f7b733?style=flat-square&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/React-Vite-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/data-localStorage_%2B_optional_cloud-8e2de2?style=flat-square&labelColor=1a1a1a" />

**🔗 Live:** [raise-the-bar-rating.vercel.app](https://raise-the-bar-rating.vercel.app) · mirror on [GitHub Pages](https://tofijak.github.io/raise-the-bar-rating/)

</div>

---

Multi-festival beer tracker. First stamp: **Raise the Bar** at Ridehuset, Aarhus, Friday 9 October 2026 (fri bar 17–21).

A React + Vite app for checking off beers, starring favorites, and rating pours in 0.25 steps. Works fully offline in `localStorage`. Optional magic-link login syncs ratings across devices.

## What’s in the glass

- Festival files under `src/festivals/` — add a JSON file and it shows up in the picker
- Raise the Bar 2026 beverage list, grouped by brewery, with session colors and No/Low
- TBA entries kept as TBA
- Untappd search links on every named beer
- Check-off, favorites, rating slider, search, and hide/unrated filters
- Per-festival achievements (same crew photos, no brand name in the copy)
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

GitHub Pages builds should keep passing `--base=/raise-the-bar-rating/` (or set `VITE_BASE=/raise-the-bar-rating/`). Asset URLs use `import.meta.env.BASE_URL`.

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

Without env vars the app stays local-only and hides sign-in. Current Vercel / Pages deploys keep working.

To turn on sync:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication → Sign-in method → Email link (passwordless)**.
3. Add authorized domains:
   - `localhost`
   - `raise-the-bar-rating.vercel.app`
   - `tofijak.github.io`
4. Create a **Firestore** database (production mode) and publish `firestore.rules` from this repo (users can only read/write `users/{theirUid}/**`).
5. Register a web app and copy the config into Vercel (and optionally GitHub Pages secrets):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Locally, copy `.env.example` to `.env.local`. On first sign-in, device ratings merge into the account (union of check-offs / stars / milestones; highest rating wins).

## Design system

Dark-first tokens and primitives live in `src/styles/tokens.css` + `src/ui/`. See [docs/design-system.md](docs/design-system.md).

## Deploy

Firebase Hosting config is included (`.firebaserc` project id is a placeholder). A GitHub Pages workflow can build with `vite --base=/raise-the-bar-rating/`.

```bash
npm run build
npx firebase deploy
```

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:8e2de2,50:fc4a1a,100:f7b733&height=120&section=footer" width="100%" />

</div>
