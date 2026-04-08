import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import Markdoc from '@markdoc/markdoc';
import { siteFrontmatterSchema, type SitePageData } from './content-schemas';

const SITE_MDOC = path.join(process.cwd(), 'src', 'content', 'site', 'index.mdoc');

function splitYamlFrontmatter(raw: string): { frontmatter: string; body: string } {
  const trimmed = raw.replace(/^\uFEFF/, '');
  if (!trimmed.startsWith('---\n')) {
    throw new Error('Expected YAML frontmatter opening ---');
  }
  const end = trimmed.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new Error('Expected YAML frontmatter closing ---');
  }
  return {
    frontmatter: trimmed.slice(4, end),
    body: trimmed.slice(end + 5),
  };
}

function renderMarkdocBody(source: string): string {
  const ast = Markdoc.parse(source.trim());
  const transformed = Markdoc.transform(ast);
  return Markdoc.renderers.html(transformed) as string;
}

/** Add target="_blank" + rel to contact links (skip mailto, tel, same-page #). */
function contactLinksOpenInNewTab(html: string): string {
  return html.replace(/<a\s+([^>]*)>/gi, (full, attrs: string) => {
    const a = attrs.trim();
    if (/\btarget\s*=/i.test(a)) {
      if (/\btarget\s*=\s*["']?_blank["']?/i.test(a) && !/\brel\s*=/i.test(a)) {
        return `<a ${a} rel="noopener noreferrer">`;
      }
      return full;
    }
    if (/href\s*=\s*["']#/i.test(a)) return full;
    if (/href\s*=\s*["']mailto:/i.test(a)) return full;
    if (/href\s*=\s*["']tel:/i.test(a)) return full;
    return `<a ${a} target="_blank" rel="noopener noreferrer">`;
  });
}

export async function loadSiteLive(): Promise<SitePageData> {
  const raw = await fs.readFile(SITE_MDOC, 'utf8');
  const { frontmatter, body } = splitYamlFrontmatter(raw);
  const parsed = parseYaml(frontmatter) as unknown;
  const data = siteFrontmatterSchema.parse(parsed);
  const contactHtml = contactLinksOpenInNewTab(renderMarkdocBody(body));
  return { ...data, contactHtml };
}
