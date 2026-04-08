/**
 * Resolve a path or URL to an absolute URL for OG/meta. Relative paths must start with `/`.
 */
export function toAbsoluteUrl(
  href: string | null | undefined,
  site: URL | undefined,
): string | undefined {
  const trimmed = href?.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (!site) return undefined;
  return new URL(path, site).href;
}
