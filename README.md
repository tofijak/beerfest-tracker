# Green Session Beer Tracker

Serpier company outing tracker for **Raise the Bar** at Ridehuset, Aarhus, Friday 9 October 2026 (fri bar 17–21).

A local-only React + Vite + MUI app for checking off beers, starring favorites, and rating pours in 0.25 steps. Same layout as the Aarhus beer tracker, rethemed for the Serpier trip.

## What’s in the glass

- Full Raise the Bar / Green Session beverage list, grouped by brewery
- Session colors (green / yellow / red) plus the No/Low section
- TBA entries kept as TBA
- Country codes and stand numbers from the official overview
- Untappd search links on every named beer
- Check-off, favorites, rating slider, search, and hide/unrated filters
- All progress stored in `localStorage` under the `greenSession.serpier.` prefix

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

## Deploy

Firebase Hosting config is included (`.firebaserc` project id `green-session-serpier` is a placeholder). A GitHub Pages workflow lives in `.github/workflows/pages.yml` for the private `tofijak` repo.

```bash
npm run build
npx firebase deploy
```

## Data

Beer data lives in `src/data/beers.js`, parsed from the official Raise the Bar beverage overview.
