# Maison Ardent

An editorial-commerce prototype for a fictional niche fragrance maison. The experience translates the top, heart, and base notes of **Lueur No. 01** into a paced, responsive scroll narrative.

## Preview locally

Serve the repository root with any static server, for example:

```sh
python3 -m http.server 4173 --directory dist
```

Then open `http://localhost:4173`.

## Structure

- `dist/index.html` — semantic page structure and commerce UI
- `dist/styles.css` — visual system, responsive layouts, motion, reduced-motion behavior
- `dist/script.js` — scrollytelling state, navigation, accordions, bag drawer, and newsletter feedback
- `dist/assets/` — original AI-generated campaign imagery
