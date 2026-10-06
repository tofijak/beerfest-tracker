<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:f7b733,50:fc4a1a,100:8e2de2&height=220&section=header&text=Raise%20the%20Bar%20%F0%9F%8D%BA&fontSize=64&fontColor=ffffff&fontAlignY=38&desc=Serpier%20%C3%97%20Ridehuset%20Aarhus%20%C2%B7%209%20Oct%202026&descAlignY=60&descSize=20&animation=twinkling" width="100%" />

<a href="https://raise-the-bar-rating.vercel.app">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=24&pause=900&color=F7B733&center=true&vCenter=true&width=640&lines=230+beers.+45+breweries.+4+hours.;Fri+bar+17%E2%80%9321+%F0%9F%8D%BB;Check+it.+Star+it.+Rate+it.;Sk%C3%A5l%2C+Serpier!" alt="Typing banner" />
</a>

<br/>

<a href="https://raise-the-bar-rating.vercel.app"><img src="https://img.shields.io/badge/%F0%9F%8D%BA_OPEN_THE_APP-raise--the--bar--rating.vercel.app-fc4a1a?style=for-the-badge&labelColor=1a1a1a" alt="Open the app" /></a>

<br/>

<img src="https://img.shields.io/badge/beers-230-f7b733?style=flat-square&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/breweries-45-f7b733?style=flat-square&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/fri_bar-17%E2%80%9321-f7b733?style=flat-square&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/React-Vite-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/data-localStorage_only-8e2de2?style=flat-square&labelColor=1a1a1a" />

**🔗 Live:** [raise-the-bar-rating.vercel.app](https://raise-the-bar-rating.vercel.app) · mirror on [GitHub Pages](https://tofijak.github.io/raise-the-bar-rating/)

</div>

---

Serpier company outing tracker for **Raise the Bar** at Ridehuset, Aarhus, Friday 9 October 2026 (fri bar 17–21).

A local-only React + Vite + MUI app for checking off beers, starring favorites, and rating pours in 0.25 steps. Same layout as the Aarhus beer tracker, rethemed for the Serpier trip.

## What’s in the glass

- Raise the Bar beers that have an Untappd rating (230 beers, 45 breweries), grouped by brewery
- Session colors (green / yellow / red) plus the No/Low section
- Country codes and stand numbers from the official overview
- Untappd search links on every named beer
- Untappd rating + rating count on every beer, with a direct link to the Untappd page
- Tap a beer for details (style, ABV, rating, quick actions)
- Filters: status, session, stand, style, ABV range, rating range, only-rated, plus sort by rating / ABV / name
- **Map** tab: schematic of the three stand areas with per-zone progress
- **Route** tab: build your own route (list-add icon on any beer, reorder, copy) or use the suggested must-try route by stand
- Dark neon UI with voxel-style 3D pixel art (mug, hop, can)
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


<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:8e2de2,50:fc4a1a,100:f7b733&height=120&section=footer" width="100%" />

</div>
