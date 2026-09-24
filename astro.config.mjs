import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Absolute URL of the live site (used for canonical, hreflang, Open Graph and the sitemap).
// Order: SITE_URL env var → Vercel production domain → Netlify URL → local dev.
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  process.env.URL ||
  'http://localhost:4321';

export default defineConfig({
  site,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: {
    // The whole stylesheet is small: inline it to avoid a render-blocking request.
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      // The root page only redirects to a language, keep it out of the sitemap.
      filter: (page) => new URL(page).pathname !== '/',
      i18n: {
        defaultLocale: 'fr',
        locales: { fr: 'fr-CA', en: 'en-CA', es: 'es' },
      },
    }),
  ],
});
