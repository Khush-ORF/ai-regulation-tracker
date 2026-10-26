import { defineConfig } from 'astro/config';

// GitHub Pages serves a project site under /<repo>/. The deploy workflow sets ASTRO_SITE and ASTRO_BASE
// from actions/configure-pages, so local builds default to the root.
export default defineConfig({
  site: process.env.ASTRO_SITE || 'http://localhost:4321',
  base: process.env.ASTRO_BASE || '/',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
