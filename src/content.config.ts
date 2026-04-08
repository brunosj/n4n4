import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { siteFrontmatterSchema } from './lib/content-schemas';

const site = defineCollection({
  loader: glob({
    base: './src/content/site',
    pattern: '**/*.mdoc',
  }),
  schema: siteFrontmatterSchema,
});

export const collections = { site };
