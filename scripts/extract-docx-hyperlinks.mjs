#!/usr/bin/env node
/**
 * Extracts external hyperlinks from a .docx (OOXML) using the system `unzip` CLI.
 * No npm dependencies — requires `unzip` on PATH (macOS/Linux; Windows: use WSL or Git Bash).
 *
 * Usage:
 *   node scripts/extract-docx-hyperlinks.mjs [path-to.docx]
 *
 * Default path: docs/Consultancy Services.docx (relative to repo root).
 */

import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const defaultDocx = join(repoRoot, 'docs', 'Consultancy Services.docx');

function unzipP(docxPath, entryPath) {
  return execFileSync('unzip', ['-p', docxPath, entryPath], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

function decodeXmlAttr(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

/** @returns {Map<string, string>} */
function parseRels(xml) {
  const map = new Map();
  const relRe = /<Relationship\s+([^>]+)\/>/g;
  let m;
  while ((m = relRe.exec(xml))) {
    const tag = m[1];
    const id = /Id="([^"]+)"/.exec(tag)?.[1];
    const type = /Type="([^"]+)"/.exec(tag)?.[1];
    const target = /Target="([^"]+)"/.exec(tag)?.[1];
    if (!id || !type || !target) continue;
    if (!type.includes('hyperlink')) continue;
    map.set(id, decodeXmlAttr(target));
  }
  return map;
}

/**
 * @param {string} docXml
 * @param {Map<string, string>} idToUrl
 */
function extractHyperlinks(docXml, idToUrl) {
  const results = [];
  const hlRe = /<w:hyperlink\b([^>]*)>([\s\S]*?)<\/w:hyperlink>/g;
  let m;
  while ((m = hlRe.exec(docXml))) {
    const attrs = m[1];
    const inner = m[2];
    const idMatch = attrs.match(/r:id="([^"]+)"/);
    if (!idMatch) continue;
    const rid = idMatch[1];
    const rawUrl = idToUrl.get(rid);
    if (!rawUrl) continue;
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) continue;
    const url = decodeXmlAttr(rawUrl);
    const texts = [...inner.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((x) => x[1]);
    const linkText = texts.join('').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    results.push({ rId: rid, linkText: linkText.trim(), url });
  }
  return results;
}

function main() {
  const docxPath = resolve(process.argv[2] ?? defaultDocx);
  let relsXml;
  let docXml;
  try {
    relsXml = unzipP(docxPath, 'word/_rels/document.xml.rels');
    docXml = unzipP(docxPath, 'word/document.xml');
  } catch (e) {
    console.error('Failed to read docx. Is the path correct and is `unzip` installed?');
    console.error(String(e?.message ?? e));
    process.exit(1);
  }

  const idToUrl = parseRels(relsXml);
  const links = extractHyperlinks(docXml, idToUrl);

  const byUrl = new Map();
  for (const row of links) {
    if (!byUrl.has(row.url)) byUrl.set(row.url, row);
  }
  const unique = [...byUrl.values()];

  console.log(JSON.stringify({ docxPath, count: links.length, uniqueCount: unique.length, links, unique }, null, 2));
}

main();
