# N4N4 — artist website

Single-page site powered by Astro and Keystatic. Public copy, images, and embeds are edited in **`/keystatic`** and stored in **`src/content/site/index.mdoc`** plus **`public/images/`**.

## Stack

- **[Astro](https://astro.build/)** (v6) — pages, layouts, and the content layer
- **[Keystatic](https://keystatic.com/)** — local CMS UI over the site singleton
- **[Markdoc](https://markdoc.dev/)** — **Contact** section body in `index.mdoc`
- **[@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/)** — Node adapter (`standalone`) for production builds
- **Eurostile** — single webfont (`public/fonts/EurostileLTStd-Ex2.otf`)

React is included for the Keystatic admin UI, not for public pages.

## Getting started

```bash
pnpm install
pnpm dev
```

This repo includes a `pnpm-lock.yaml`; other package managers work if you prefer.

## Scripts

| Command        | Description                  |
| -------------- | ---------------------------- |
| `pnpm dev`     | Dev server with hot reload   |
| `pnpm build`   | Production build to `dist/`  |
| `pnpm preview` | Preview the production build |

## Local URLs (dev)

- **Site:** [http://127.0.0.1:4322](http://127.0.0.1:4322)
- **Keystatic admin:** [http://127.0.0.1:4322/keystatic](http://127.0.0.1:4322/keystatic)

## Site structure

| Route | Purpose                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------- |
| `/`   | Full-page home: background, logo, title, press, album embed, **Video** (thumbnail + iframe), **Contact** (Markdoc HTML) |

`Layout.astro` is a thin shell (meta, font preload, main slot)—no separate header/footer components.

## Project layout

```
src/
├── layouts/
│   └── Layout.astro
├── pages/
│   └── index.astro           # Home (SSR, loadSiteLive)
├── lib/
│   ├── load-live-content.ts  # Reads index.mdoc → frontmatter + contactHtml
│   ├── content-schemas.ts    # Zod: siteFrontmatterSchema
│   └── embed-iframe.ts       # Parses album / video embed URL or iframe HTML
├── content/
│   └── site/
│       └── index.mdoc        # Singleton: YAML frontmatter + Contact Markdoc body
├── styles/
│   └── global.css
content.config.ts             # Astro: single `site` collection (**/*.mdoc)
keystatic.config.ts           # Keystatic: `site` singleton only
astro.config.mjs
public/
├── fonts/
│   └── EurostileLTStd-Ex2.otf
└── images/
    ├── logo/                 # Logo uploads (Keystatic)
    ├── site-background/      # Hero background uploads
    └── video/                # Video thumbnail uploads
```

Keep **`keystatic.config.ts`**, **`src/lib/content-schemas.ts`**, and **`src/content.config.ts`** in sync when you add or rename fields.

## Content model (summary)

- **Site** (`src/content/site/index.mdoc`) — one file: structured fields in YAML frontmatter (`title`, `description`, `logo`, `backgroundPicture`, `pressText`, `albumIframe`, `video.videoIframe`, `video.thumbnail`) and **Contact** as the Markdoc **body** after the second `---`.

Keystatic uses **`storage: { kind: 'local' }`**; commits to this repo are the source of truth for content.

## Documentation

- **[docs/keystatic-cms.md](docs/keystatic-cms.md)** — technical wiring (loaders, SSR, field list)
- **[docs/keystatic-editing-guide.md](docs/keystatic-editing-guide.md)** — short guide for non-developers
- **[docs/info.md](docs/info.md)** — reference bio / press-style copy (not used by the CMS unless copied into Keystatic)
