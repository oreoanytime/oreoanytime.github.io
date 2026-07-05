# Personal Portfolio — Adrianus Tjoatja Widjaja

A single-page, dark, "data-pipeline" themed portfolio. Framework-free: plain
HTML, CSS, and vanilla JS with [anime.js](https://animejs.com/) for motion.
No build step, no `node_modules`.

## Structure

```
index.html          # all sections + CDN script tags
css/styles.css      # design tokens, layout, components, reduced-motion fallbacks
js/main.js          # anime.js orchestration (guarded), scroll progress, reveals, count-ups
assets/
  favicon.svg       # brand mark
  resume.pdf        # ← drop your résumé here (the "Résumé" button links to it)
```

## Preview locally

It's a static site — just open the file:

- Double-click `index.html`, **or**
- Serve it (nicer for testing): `python -m http.server 8000` then open
  <http://localhost:8000>.

## Deploy (any static host)

- **GitHub Pages:** push to a repo, enable Pages on the default branch (root).
- **Netlify / Cloudflare Pages:** point at the repo; no build command, publish
  directory = project root.

## Things to fill in

The page ships with confident, honest defaults (no visible placeholder text).
Adjust these to your real figures if you like:

- **Impact count-ups** — edit `data-count` on the `.count` spans in the Impact
  section of `index.html` (`<60s`, `0` gatekept requests, `100%` automated,
  `6 mo`). The surrounding `<em>` tags hold the prefix/suffix (`<`, `s`, `%`, `mo`).
- **GitHub / Résumé** — currently omitted (no GitHub page; résumé not updated).
  To add later: re-add a `.btn` in the hero and Contact `.hero__ctas`; for the
  résumé, drop `assets/resume.pdf` and link it.

## Design notes

- **Single accent** gradient (cyan → violet) used consistently.
- **All motion is feature-guarded.** If anime.js fails to load (e.g. CDN
  blocked) *or* the visitor has `prefers-reduced-motion: reduce`, the page
  renders fully visible and static — start-states only apply under the
  `.anim-ready` class that `main.js` adds when motion is enabled.
- anime.js is pinned to **v3.2.2** (stable UMD `window.anime` global).

## Content / NDA note

The work is described in **domain-neutral** terms (device/sensor telemetry,
media archives, a debugging & analytics platform). Engineering *patterns*
(feature fences, federation/caching decisions, bundling discipline) are the
showcase; no product, sport, or customer specifics appear. Keep it that way
when editing.
