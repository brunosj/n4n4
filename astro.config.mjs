import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://n4n4.de',
  // Baked into @astrojs/node standalone: listen on all interfaces so 127.0.0.1 works for
  // Caddy/nginx. Without this, some systems only bind ::1 and curl 127.0.0.1:PORT refuses.
  server: {
    host: true,
    port: 4322,
  },
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [react(), markdoc(), keystatic()],
  // Vite only loads .env* from here (not repo root). Root `.env` is for the VPS / PM2 only
  // (deploy.sh); otherwise `astro build` tries to open root `.env` and can hit EACCES if
  // permissions/ownership are wrong.
  vite: {
    envDir: path.join(__dirname, 'vite-env'),
  },
});
