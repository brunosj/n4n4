/** First `src` from an iframe tag string (for lazy-load poster flow). */
export function extractIframeSrc(html: string): string | null {
  const m = html.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  const s = m?.[1]?.trim();
  return s || null;
}

/** Parse CMS iframe fields (album, video, etc.): bare URL or full `<iframe …>` HTML. */
export function getIframeEmbed(
  raw: string,
): { kind: 'src'; src: string } | { kind: 'html'; html: string } | null {
  const t = raw.trim();
  if (!t) return null;
  if (/<iframe/i.test(t)) {
    return { kind: 'html', html: t };
  }
  if (/^https?:\/\//i.test(t)) return { kind: 'src', src: t };
  return null;
}

/** @deprecated Use `getIframeEmbed` — same behavior. */
export const getAlbumEmbed = getIframeEmbed;
