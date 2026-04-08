# Keystatic CMS in this project

This document describes how [Keystatic](https://keystatic.com/) is wired up: where content lives, what you can edit in the UI, and how that connects to Astro.

## What Keystatic does here

Keystatic is a **Git-based CMS UI** that runs alongside the Astro app. When you save in the admin:

- Content is written to **files in the repo** (one Markdoc file for the whole site under `src/content/site/`, plus images under `public/images/`).
- The **public site** reads the same files at request time (SSR) and Astro’s [content collections](https://docs.astro.build/en/guides/content-collections/) (`src/content.config.ts`) stay aligned with the on-disk shape.

There is no separate database for content in **local** mode.

## Admin UI

- **URL:** `/keystatic` (with the dev server: e.g. `http://localhost:4322/keystatic`).
- **Config file:** [`keystatic.config.ts`](../keystatic.config.ts) at the project root defines the singleton and fields.
- **Astro integration:** `@keystatic/astro` is registered in [`astro.config.mjs`](../astro.config.mjs).

## Storage mode

```ts
storage: {
  kind: 'local';
}
```

Edits are saved **directly to the filesystem** in this repository. Commit and push those files like any other code change.

To use **GitHub** or **Keystatic Cloud** storage instead, you would change `storage` in `keystatic.config.ts` and follow Keystatic’s docs for that mode (OAuth, branches, etc.).

## Content model

| Keystatic concept | In this project | On disk                                                         |
| ----------------- | --------------- | --------------------------------------------------------------- |
| **Singleton**     | `site`          | [`src/content/site/index.mdoc`](../src/content/site/index.mdoc) |

There are **no collections**—everything editable in the CMS is a single **Site** document.

## Site singleton (`site`)

- **Path:** `src/content/site/` (trailing slash in config) → Keystatic writes **`index.mdoc`** there.
- **Format:** `format: { contentField: 'contact' }` — YAML **frontmatter** holds structured fields; the **Markdoc body** is the **Contact** rich-text section (headings, bold, lists, links).

### Frontmatter fields (structured)

| Field               | Role                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `title`             | Page title and main heading on the home page                                                |
| `description`       | Intro copy and HTML meta description                                                        |
| `logo`              | Image in `public/images/logo/` → served under `/images/logo/`                               |
| `backgroundPicture` | Full-viewport background on the hero stack (`public/images/site-background/`)               |
| `pressText`         | Multiline plain text (line breaks preserved on the site)                                    |
| `albumIframe`       | Embed URL (e.g. Spotify/Bandcamp) or iframe snippet; rendered as an iframe on the home page |
| `video`             | Object with `videoIframe` (URL or iframe HTML) and optional `thumbnail` (`public/images/video/`) |

### Body field (`contact`)

The **Contact** block in the admin maps to the Markdoc **body** after the second `---` in `index.mdoc`. It is rendered to HTML with [`@markdoc/markdoc`](https://markdoc.dev/) in [`src/lib/load-live-content.ts`](../src/lib/load-live-content.ts).

## How Astro picks up the same file

[`src/content.config.ts`](../src/content.config.ts) defines a single **`site`** collection:

| Astro collection | Loader `base`        | Pattern     | Role                                                          |
| ---------------- | -------------------- | ----------- | ------------------------------------------------------------- |
| `site`           | `./src/content/site` | `**/*.mdoc` | Frontmatter validated with Zod (`src/lib/content-schemas.ts`) |

**Important:** Field names and shapes should stay aligned between:

1. **`keystatic.config.ts`** (what the CMS shows and writes), and
2. **`siteFrontmatterSchema`** in **`src/lib/content-schemas.ts`** (and the collection schema in `content.config.ts`).

If they drift, `astro build` / content sync may report schema errors.

## SSR and live content

The home page uses **`export const prerender = false`** so saves in `/keystatic` show after a refresh without rebuilding.

[`src/lib/load-live-content.ts`](../src/lib/load-live-content.ts) **`loadSiteLive()`**:

1. Reads `src/content/site/index.mdoc` from disk.
2. Splits YAML frontmatter and Markdoc body.
3. Parses frontmatter with **`yaml`** and validates with **`siteFrontmatterSchema`**.
4. Renders the body with **Markdoc** → `contactHtml`.

There is **no** Keystatic Reader usage for this route; a single read keeps frontmatter and body in sync with the file Keystatic writes.

## Typical editing workflow

1. Run `pnpm dev`.
2. Open `/keystatic` (with HTTP Basic auth in production if configured in middleware—see `.env` / deploy notes).
3. Edit **Site** and save.
4. Confirm `src/content/site/index.mdoc` (and any new files under `public/images/...`) changed.
5. Commit changes. CI/production runs `astro build`, which uses the updated files.

You can also edit **`index.mdoc` directly** in the editor; Keystatic will read the same format on next open.

## Adding or changing fields

1. Update **`keystatic.config.ts`** (`fields.*` on the `site` singleton).
2. Update **`siteFrontmatterSchema`** in **`src/lib/content-schemas.ts`** and the **`site`** collection schema in **`src/content.config.ts`** if needed.
3. Run **`pnpm astro sync`** so types under `.astro/` stay current.
4. Update **`src/pages/index.astro`** (data wiring) and **`src/components/home/`** (markup + **`home.css`**) if you added new data to display.

## Further reading

- [Keystatic docs](https://keystatic.com/docs)
- [Keystatic format options](https://keystatic.com/docs/format-options) (e.g. `contentField` + Markdoc)
- [Keystatic + Astro](https://keystatic.com/docs/installation-astro)
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
