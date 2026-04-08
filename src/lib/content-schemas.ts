import { z } from 'astro/zod';

/** Frontmatter in `src/content/site/index.mdoc` — matches Keystatic singleton fields (excluding Markdoc body). */
export const siteFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string().nullish(),
  backgroundPicture: z.string().nullish(),
  pressText: z.string().default(''),
  albumIframe: z.string().default(''),
  video: z
    .object({
      videoIframe: z.string().default(''),
      thumbnail: z.string().nullish(),
    })
    .default({ videoIframe: '', thumbnail: null }),
});

export type SiteFrontmatter = z.infer<typeof siteFrontmatterSchema>;

export type SitePageData = SiteFrontmatter & {
  contactHtml: string;
};
