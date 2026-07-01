# World Cup Bracket

A radial 32-team knockout bracket rendered from a configuration file, in the
style of the classic circular World Cup graphic — flags and federation crests
around the rim, a glowing trophy at the centre, and coloured paths tracing the
teams that are advancing.

## View it

Just open `index.html` in a browser (double-click it). Everything is bundled
locally — no server, no internet, no build step required.

*(Optional)* to serve it: `python3 -m http.server --directory . 8777` then open
<http://localhost:8777>.

## Files

| File          | Purpose                                                       |
| ------------- | ------------------------------------------------------------- |
| `index.html`  | Page shell. Loads `config.js` then `render.js`.               |
| `config.js`   | **The only file you edit** — teams, seeding, and results.     |
| `render.js`   | Reads the config and draws the radial SVG bracket.            |
| `styles.css`  | Dark/gold theme, glow, eliminated-team styling.               |
| `assets/`     | `flags/` (PNG), `badges/` (federation crests), `trophy.svg`.  |

## Editing the bracket

Open `config.js`. It is fully commented. In short:

- **`teams`** — one entry per team: `name`, `iso` (flag code), `badge` (crest
  filename), and an optional `accent` colour for that team's winning path.
- **`seeds`** — the 32 team keys in ring order (clockwise from the top). Adjacent
  pairs `(0,1), (2,3), …` are the Round-of-32 games.
- **`results`** — the winner of each match, by team key. Use `null` for a game
  that hasn't been played — its path stays grey and both teams stay in colour.
  A team that **loses** a decided match is automatically greyed out.

Change any value and reload — the whole bracket re-renders from the config.

## Asset sources (official)

- **Flags** — [flagcdn.com](https://flagcdn.com) (`w320` PNG, ISO 3166 codes).
- **Federation crests** — Wikimedia (Wikimedia Commons where the logo is
  public-domain text/geometry; English Wikipedia for the non-free crests),
  fetched via each federation's `Special:FilePath`.
- **Trophy** — hand-authored stylised SVG (`assets/trophy.svg`); the real FIFA
  trophy is trademarked, so this avoids licensing issues.

## Current Round of 32 results

The current `config.js` encodes these decided Round of 32 matches:

- Canada over South Africa
- Brazil over Japan
- Paraguay over Germany on penalties
- Netherlands over Morocco on penalties
- Norway over Ivory Coast
- France over Sweden
- Mexico over Ecuador
