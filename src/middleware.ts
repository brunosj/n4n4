import type { MiddlewareHandler } from 'astro';
import { timingSafeEqual } from 'node:crypto';

function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function parseBasicAuth(header: string | null): { user: string; pass: string } | null {
  if (!header?.startsWith('Basic ')) return null;
  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const i = decoded.indexOf(':');
    if (i === -1) return null;
    return { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
  } catch {
    return null;
  }
}

const SAVE_INDICATOR_SCRIPT = `<script>
(() => {
  if (window.__keystaticSaveIndicatorMounted) return;
  window.__keystaticSaveIndicatorMounted = true;

  const badge = document.createElement('div');
  badge.textContent = 'Waiting for save...';
  Object.assign(badge.style, {
    position: 'fixed',
    right: '16px',
    bottom: '16px',
    zIndex: '99999',
    padding: '8px 12px',
    borderRadius: '999px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '12px',
    letterSpacing: '0.02em',
    background: 'rgba(17, 24, 39, 0.9)',
    color: '#fff',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    transition: 'opacity 160ms ease',
  });
  document.body.appendChild(badge);

  const show = (text, ok = true) => {
    const now = new Date().toLocaleTimeString();
    badge.textContent = ok ? text + ' at ' + now : text;
    badge.style.background = ok ? 'rgba(16, 111, 72, 0.92)' : 'rgba(168, 43, 43, 0.92)';
    badge.style.opacity = '1';
    window.clearTimeout(window.__keystaticSaveIndicatorTimer);
    window.__keystaticSaveIndicatorTimer = window.setTimeout(() => {
      badge.style.opacity = '0.72';
      if (ok) badge.style.background = 'rgba(17, 24, 39, 0.9)';
    }, 2500);
  };

  const isWriteRequest = (url, method) =>
    /\\/keystatic/i.test(url) && !['GET', 'HEAD', 'OPTIONS'].includes((method || 'GET').toUpperCase());

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const method = init?.method || (typeof input === 'object' && input && 'method' in input ? input.method : 'GET');
    const url = typeof input === 'string' ? input : String(input?.url || '');
    try {
      const res = await nativeFetch(input, init);
      if (isWriteRequest(url, method)) {
        show(res.ok ? 'Saved' : 'Save failed', res.ok);
      }
      return res;
    } catch (err) {
      if (isWriteRequest(url, method)) show('Save failed', false);
      throw err;
    }
  };
})();
</script>`;

async function maybeInjectKeystaticSaveIndicator(pathname: string, response: Response): Promise<Response> {
  if (!pathname.startsWith('/keystatic')) return response;
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) return response;
  const html = await response.text();
  if (html.includes('__keystaticSaveIndicatorMounted')) return response;
  const injected = html.includes('</body>')
    ? html.replace('</body>', `${SAVE_INDICATOR_SCRIPT}</body>`)
    : `${html}${SAVE_INDICATOR_SCRIPT}`;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;
  if (!pathname.startsWith('/keystatic')) {
    return next();
  }

  const expectedUser = process.env.KEYSTATIC_BASIC_AUTH_USER ?? 'editor';
  const expectedPass = process.env.KEYSTATIC_BASIC_AUTH_PASSWORD;

  if (!expectedPass?.length) {
    if (process.env.NODE_ENV === 'production') {
      return new Response(
        'Keystatic admin is unavailable: set KEYSTATIC_BASIC_AUTH_PASSWORD on the server (e.g. in .env).',
        { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
      );
    }
    const response = await next();
    return maybeInjectKeystaticSaveIndicator(pathname, response);
  }

  const creds = parseBasicAuth(context.request.headers.get('authorization'));
  if (
    creds &&
    safeEqualStrings(creds.user, expectedUser) &&
    safeEqualStrings(creds.pass, expectedPass)
  ) {
    const response = await next();
    return maybeInjectKeystaticSaveIndicator(pathname, response);
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Keystatic admin"',
      'Cache-Control': 'no-store',
    },
  });
};
