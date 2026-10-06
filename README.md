# Green Session Beer Tracker

Serpier company outing tracker for **Raise the Bar** at Ridehuset, Aarhus, Friday 9 October 2026 (fri bar 17–21).

A local-only React + Vite + MUI app for checking off beers, starring favorites, rating pours in 0.25 steps, and unlocking the RSVP crew as you rate. Same layout as the Aarhus beer tracker, rethemed for the Serpier trip.

## What’s in the glass

- Full Raise the Bar / Green Session beverage list, grouped by brewery
- Session colors (green / yellow / red) plus the No/Low section
- TBA entries kept as TBA
- Country codes and stand numbers from the official overview
- Untappd search links on every named beer
- Check-off, favorites, rating slider, search, and hide/unrated filters
- Achievements unlock from **ratings count** (slider above 0)
- All progress stored in `localStorage` under the `greenSession.serpier.` prefix

## Achievements

Rate beers (check one off, then move the slider). Each threshold unlocks one RSVP photo:

| Rated | Person |
| ---: | --- |
| 3 | Simon Toft |
| 6 | Nicholas Erlin Putra |
| 10 | Simon Holm |
| 15 | Christian Dam |
| 20 | Kamilla Kjøbmand |
| 25 | Thomas Grástein |
| 35 | Nicklas |
| 50 | Jacob Schwartz Sørensen |
| 75 | Steffen Sørensen |

Triple-tap the title to reset unlocks. A simple splash reminds you: *Fri bar 17–21 — planlæg hvad I skal smage*.

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
