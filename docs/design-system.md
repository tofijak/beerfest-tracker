# Beer Fest Tracker design system

Small, dark-first system for a phone-in-the-hall festival app. Tokens are the source of truth. Primitives consume tokens. Screens do not invent new colors or radii.

## Tokens

Defined once in `src/styles/tokens.css`. Dark is the default (`<html data-theme="dark">`). Light is an opt-in override on the same variables.

| Group | What it covers |
| --- | --- |
| Color | `--bg`, `--surface`, `--text`, amber / orange / purple accents, session tones, hero gradients |
| Typography | Display **Syne**, body **Outfit**, mono **IBM Plex Mono**; `--fs-xs` → `--fs-4xl` |
| Spacing | 4px rhythm: `--space-1` (4px) through `--space-16` (64px) |
| Radii | `--radius-sm` … `--radius-xl`, `--radius-pill` |
| Shadows | Soft elevation plus amber / purple glow |
| Motion | `--dur-fast/med/slow`, `--ease-out`, `--ease-spring`; all collapse under `prefers-reduced-motion` |

Ambient page wash: orange blob left, purple blob right, gold at the floor — same amber / orange / purple as the README header.

## Primitives

All in `src/ui/`.

| Component | Use |
| --- | --- |
| `Button` | `primary` (gold gradient), `secondary` (glass), `ghost`, `danger` |
| `Card` | Glassy brewery / passport surfaces |
| `Chip` / `Badge` | Session colors, counts on the bottom nav |
| `Slider` | 0–5 rating in 0.25 steps, gold thumb |
| `Input` | Pill search / email fields |
| `Segmented` | Bottom nav (beers / stars / crew / passport) |
| `Sheet` | Festival picker + magic-link login (bottom sheet on phones) |
| `Modal` | Achievement unlock, with a celebrate glow |
| `Avatar` | Crew photos on unlock |
| `Toast` | Magic-link sent / errors |
| `EmptyState` | Favorites, history, search misses |
| `Checkbox` / `IconButton` | Check-off and favorite, with a short pop |

## Motion

- Check-off: checkbox pops and the row washes green
- Favorite: star pops to gold
- Rating: thumb scales while dragging
- Achievement: modal scales in; glow pulse is disabled when the user prefers reduced motion (durations go to `0.01ms`)

## Layout

Mobile-first. Sticky glass header, single-column `42rem` content, floating glass bottom nav with safe-area padding. 44px tap targets. Focus rings use amber on dark.

## Theme

`ThemeProvider` stores `beerFest.theme` (`dark` \| `light`). The sun control in the header toggles it.
