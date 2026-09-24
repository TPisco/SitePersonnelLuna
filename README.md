# Lunayla: official website

A one-page, trilingual (FR / EN / ES) presentation site for the artist Lunayla.
Static [Astro](https://astro.build) site: no backend, no payments, no tracking.

- French is the default: `/fr/`, `/en/`, `/es/`. The root `/` sends visitors to their saved language, or to their browser language if it is English or Spanish, else to French.
- Sections: Hero → About → Music → Achievements → Gallery → Contact.
- Styling: plain CSS with custom properties (the palette lives in `src/styles/global.css`), no CSS framework.

## Run it

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # production build in dist/
npm run preview      # serve dist/ locally
npm run check        # type-check .astro and .ts files
npm run translations # regenerate TRANSLATIONS_REVIEW.md
```

## Where to edit things

```
src/
├─ i18n/
│  ├─ fr.json          ← every UI string + the bio, in French
│  ├─ en.json          ← same keys in English
│  └─ es.json          ← same keys in Spanish
├─ data/
│  ├─ site.json        ← email, streaming and social links, latest release link
│  ├─ achievements.json← the dated achievements list
│  ├─ music.json       ← singles (covers, links) and YouTube videos
│  └─ gallery.json     ← gallery photos + alt text in 3 languages
├─ assets/
│  ├─ photos/          ← hero, about, stage and gallery photos (originals, never shipped as-is)
│  ├─ covers/          ← single covers
│  └─ thumbs/          ← video thumbnails
├─ components/         ← one file per section (Hero, About, Music, …)
├─ layouts/Base.astro  ← <head>: SEO, Open Graph, hreflang, fonts
├─ pages/
│  ├─ index.astro      ← language redirect for "/"
│  └─ [lang]/index.astro ← the page, built once per language
├─ scripts/main.ts     ← menu, marquee pause, reveal, embeds, copy email, form, lightbox
└─ styles/global.css   ← colors, type, buttons, shared styles
materials/SOURCES.md   ← where every fact and photo comes from
```

- **Text**: change it in all three `src/i18n/*.json` files (same key in each). A missing key breaks the build on purpose.
- **Email / links**: `src/data/site.json`.
- **Photos**: drop a `.jpg` / `.JPG` (or `.png`, `.webp`) in `src/assets/photos/` and reference it by file name, without the extension. Astro makes AVIF/WebP versions in several sizes at build time. To add one to the gallery, add an entry to `src/data/gallery.json` with its alt text in the 3 languages; portrait and landscape photos both work. Keep only photos the site uses in that folder (an unused photo still gets copied into the build), and keep videos and RAW files (`.mov`, `.ARW`) out of it: they are git-ignored.

## Add an achievement

Add an object to `items` in `src/data/achievements.json`. Order in the file doesn't matter: the list is sorted by `date`.

```json
{
  "id": "festival-2027",
  "date": "2027-06-21",
  "title": { "fr": "Concert au Festival X", "en": "Concert at Festival X", "es": "Concierto en el Festival X" },
  "place": { "fr": "Montréal, QC", "en": "Montréal, QC", "es": "Montreal, QC" }
}
```

- `date` (`YYYY-MM-DD`) is shown as `21-06-2027`. Use `dateLabel` to show text instead, e.g. `{ "fr": "Automne 2027", "en": "Fall 2027", "es": "Otoño 2027" }`.
- Dates after the build day appear first with an **À venir / Upcoming / Próximamente** tag. Rebuild (or redeploy) after the event to move it into the past list.
- `"template": true` appends **(À CHANGER) / (TO BE CHANGED) / (POR CAMBIAR)**. Use it for anything not confirmed yet, and remove it once the item is real.
- `source` is optional and only for your records.

## Contact form

There is no server. The form (and the "Write to me" button) opens the visitor's email app
with a pre-filled message to the address in `src/data/site.json` (`mailto:`), the same approach
as francisco-tuozzo.com. There is also a "Copy" button for the address.

## Deploy

**Vercel (recommended, zero config):** push the repo to GitHub, then "Add New → Project" on Vercel and import it.
Vercel detects Astro automatically (build `npm run build`, output `dist`).
The canonical URL, Open Graph links and sitemap use Vercel's production domain automatically.
With a custom domain, add an environment variable `SITE_URL=https://your-domain.com` in the Vercel project settings and redeploy.

**Netlify:** build command `npm run build`, publish directory `dist`. Netlify's `URL` variable is used automatically.

## Performance and accessibility notes

- Spotify and YouTube players are **click-to-load**: nothing from those services loads until the visitor clicks.
- Fonts (Anton, DM Sans) are self-hosted, with no call to Google Fonts.
- Motion (marquees, reveals, floating stickers) is disabled under `prefers-reduced-motion`. Each marquee also has a pause button.
- Every image has alt text in all three languages. Video thumbnails sit inside buttons whose label names the video.
