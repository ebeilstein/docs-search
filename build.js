#!/usr/bin/env node
// Reads every Markdown guide in docs/ and writes search-index.json for the page.
// No dependencies: run with `node build.js`.

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, 'docs');
const OUT_FILE = path.join(__dirname, 'search-index.json');

function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  return { meta, body: src.slice(m[0].length) };
}

// Splits the body into an intro plus "## Heading" sections.
function splitSections(body) {
  const sections = [];
  let current = { heading: '', lines: [] };
  for (const line of body.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.*)$/);
    if (h) {
      sections.push(current);
      current = { heading: h[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections;
}

// Top-level numbered items become steps; indented lines below an item are its details.
function parseSteps(lines) {
  const steps = [];
  for (const line of lines) {
    const item = line.match(/^\d+[.)]\s+(.*)$/);
    if (item) steps.push({ text: item[1].trim(), details: [] });
    else if (steps.length && /^\s+\S/.test(line)) steps[steps.length - 1].details.push(line.trim());
  }
  return steps.map(s => ({ text: s.text, details: s.details.join(' ') }));
}

function parseBullets(lines) {
  return lines.filter(l => /^\s*[-*]\s+/.test(l)).map(l => l.replace(/^\s*[-*]\s+/, '').trim());
}

const guides = [];
for (const file of fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md')).sort()) {
  const id = file.replace(/\.md$/, '');
  const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(DOCS_DIR, file), 'utf8'));
  const sections = splitSections(body);
  const find = name => sections.find(s => s.heading.toLowerCase() === name);

  const stepsSection = find('steps');
  const steps = stepsSection ? parseSteps(stepsSection.lines) : [];
  if (!steps.length) {
    console.warn(`warning: ${file} has no numbered steps under "## Steps"; skipped`);
    continue;
  }

  guides.push({
    id,
    title: meta.title || id,
    category: meta.category || 'General',
    keywords: (meta.keywords || '').split(',').map(k => k.trim()).filter(Boolean),
    intro: sections[0].lines.join(' ').replace(/\s+/g, ' ').trim(),
    before: parseBullets((find('before you start') || { lines: [] }).lines),
    steps,
    troubleshooting: parseBullets((find('if something goes wrong') || { lines: [] }).lines),
  });
}

fs.writeFileSync(OUT_FILE, JSON.stringify({ guides }, null, 2) + '\n');
console.log(`Indexed ${guides.length} guide(s) -> ${path.basename(OUT_FILE)}`);
