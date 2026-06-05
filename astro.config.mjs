import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nmarchand73.github.io',
  base: '/gateway_experience',
  output: 'static',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  build: {
    assets: '_assets',
  },
});
