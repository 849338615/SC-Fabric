# Sidechain Security — Marketing Site

Static marketing site for [sidechainsecurity.com](https://www.sidechainsecurity.com/). Plain HTML, CSS, and JavaScript — no build step, no framework, no server required.

## Project structure

```
.
├── index.html            # The site (single page)
├── styles.css            # All styling
├── script.js             # Main interactions & animations
├── react-bg.js           # Background visual layer (React UMD)
├── react-beam.js         # Beam animation effect (React UMD)
├── three-core.js         # Three.js cyber-core scene (lazy-loaded)
├── favicon.ico / .png    # Browser tab icons (fallback; primary favicon is inline SVG in index.html)
└── assets/
    ├── sidechain-logo.png    # Brand logo used in nav
    └── logos/                # Partner / vendor logos (Checkpoint, Huntress, AWS, Azure, etc.)
```

`three-core.js` is loaded by name from `index.html` only when the cyber-core element scrolls into view, to keep the initial page weight low. If you rename it, update the `CORE` variable in `index.html`.

External dependencies (loaded from CDN, no install needed):

- React 18 (UMD) — `unpkg.com/react@18`
- GSAP + ScrollTrigger — `cdnjs.cloudflare.com/ajax/libs/gsap`
- Three.js r134 + post-processing shaders — `unpkg.com/three@0.134.0`
- Google Fonts: Plus Jakarta Sans, Space Mono

## Previewing locally

You need a local web server (opening `index.html` directly via `file://` will break the lazy-loaded scripts due to browser CORS rules).

```bash
# Python (built into macOS / Linux)
python3 -m http.server 8000
# then open http://localhost:8000

# Or, if you have Node:
npx serve .
```

## Deploying

Any static host works since there's no build step. Push the contents of this repo to one of:

| Host | Notes |
|---|---|
| **GitHub Pages** | Free. Enable in repo Settings → Pages. Point `sidechainsecurity.com` DNS at GitHub. |
| **Vercel** | Free tier. Import the repo — auto-deploys on every push to `main`. |
| **Netlify** | Free tier. Drag-drop deploy or git integration. |
| **Cloudflare Pages** | Free. Especially nice if your DNS is already on Cloudflare. |
| **Your own server** | Upload the files to any web server (nginx, Apache, S3 + CloudFront, etc.). |

Whichever you pick, point the `sidechainsecurity.com` DNS records at it. SSL is automatic on the managed hosts above.

## Editing the site

Because everything is plain HTML/CSS/JS, edits can be made directly in the source files. Common changes:

- **Copy / wording** — find the text in `index.html` and edit in place.
- **Colors / spacing / typography** — edit `styles.css`.
- **Adding a partner logo** — drop the image into `assets/logos/`, then add a `<div class="logo-item"><img src="assets/logos/your-file.png" alt="Brand" ... /></div>` line in the partner-logo grid in `index.html` (search for one of the existing logos to find the section).
- **Animations / interactivity** — `script.js` contains most of the page behavior; `react-bg.js`, `react-beam.js`, and `three-core.js` handle the heavier visual effects.

If you use [Claude Code](https://www.claude.com/claude-code), you can describe changes in plain English and have it edit the files for you — the codebase is small enough to fit comfortably in context.

## Browser support

Tested on modern Chrome, Safari, Firefox, and Edge. The Three.js cyber-core effect requires WebGL; the page degrades gracefully on devices without it.
