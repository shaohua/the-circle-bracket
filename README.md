# thecirclebracket.com

A static, config-driven radial bracket for the 2026 World Cup knockout stage.

The page is plain HTML, CSS, and JavaScript. There is no framework, build step,
server runtime, or external data fetch at render time. Team flags, federation
crests, and the trophy SVG are bundled under `assets/`.

## Run locally

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 8777 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8777/index.html
```

## Deploy

This project deploys as a static site.

For Vercel:

- Framework preset: `Other`
- Build command: leave blank
- Output directory: `.`

Pushing to `main` is enough for Vercel's Git integration to redeploy.

## Project Files

| Path | Purpose |
| --- | --- |
| `index.html` | Page shell and credits block. |
| `styles.css` | Layout, bracket styling, dark background, credit styling. |
| `config.js` | Teams, assets, seed order, and match results. |
| `render.js` | SVG renderer for the circular bracket. |
| `assets/flags/` | Local flag PNGs. |
| `assets/badges/` | Local federation crest files. |
| `assets/trophy.svg` | Local stylized trophy artwork. |

## Editing Bracket Data

Most changes belong in `config.js`.

- `teams`: team metadata, flag code, badge file, and optional winner-path color.
- `seeds`: the 32 teams in circular order. Adjacent pairs are Round of 32 games.
- `results`: winner keys for each round. Use `null` for matches that are not
  decided yet.

When a result is set, the winner advances inward and the loser is dimmed. Reload
the page after editing `config.js`.

## Current Data State

The current bracket order follows the supplied PDF bracket.

Confirmed Round of 32 winners:

- Brazil over Japan
- Norway over Ivory Coast
- Mexico over Ecuador
- England over DR Congo
- Morocco over Netherlands, on penalties
- Canada over South Africa
- France over Sweden
- Paraguay over Germany, on penalties

All other Round of 32 matches are still marked as undecided.

## Credits

- Original bracket graphic: [Emilio Sansolini](https://x.com/EmilioSansolini)
- Repository: [shaohua/the-circle-bracket](https://github.com/shaohua/the-circle-bracket)

## Asset Notes

- Flags are bundled from [FlagCDN](https://flagcdn.com).
- Federation crests were sourced from Wikimedia/English Wikipedia file paths.
- The trophy is a local stylized SVG, not the official FIFA trophy image.

## License

The source code is available under the [MIT License](LICENSE).

This repo also contains third-party flag and federation-crest assets. Check the
upstream asset terms before reuse outside this project.
