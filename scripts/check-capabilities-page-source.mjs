#!/usr/bin/env node
import fs from 'node:fs';

const pageSource = fs.readFileSync('src/pages/CapabilitiesPage.tsx', 'utf8');
const ctaSource = fs.readFileSync('src/data/siteChrome.ts', 'utf8');
const appSource = fs.readFileSync('src/App.tsx', 'utf8');
const smokeSource = fs.readFileSync('scripts/agent-smoke.sh', 'utf8');

const failures = [];

function requireIncludes(label, value, source = pageSource) {
  if (!source.includes(value)) {
    failures.push(`Capabilities page source is missing ${label}: ${value}`);
  }
}

function requireRegex(label, regex, source = pageSource) {
  if (!regex.test(source)) {
    failures.push(`Capabilities page source is missing ${label}.`);
  }
}

const submitStart = pageSource.indexOf('async function handleSubmit');
const submitEnd = pageSource.indexOf('\n  return (', submitStart);
const submitSource =
  submitStart >= 0 && submitEnd > submitStart
    ? pageSource.slice(submitStart, submitEnd)
    : '';

if (!submitSource) {
  failures.push('Capabilities page source is missing handleSubmit implementation.');
}

requireIncludes('Founder statement headline', 'Urblo Capability Statement 2026');
requireIncludes('reference-style capability map heading', 'A capability map for complex stone work.');
requireIncludes('PDF download section anchor', 'id="capability-statement"');
requireIncludes('download success CTA', 'Download PDF');
requireIncludes('PDF download CTA data', 'capabilityStatementDownload', ctaSource);
requireIncludes(
  'download PDF asset path',
  '/downloads/urblo-capability-statement-2026.pdf',
  ctaSource,
);
requireIncludes('shared Capabilities navigation CTA', "label: siteCtas.capabilities.label", ctaSource);
requireIncludes('capabilities route without generic route banner', 'path="/capabilities"', appSource);
requireIncludes('capabilities source check smoke integration', 'node scripts/check-capabilities-page-source.mjs', smokeSource);
requireIncludes('public Turnstile widget reuse', 'TurnstileField');
requireIncludes('public Turnstile site key reuse', 'turnstileSiteKey');
requireIncludes('download lead project type', 'Capability statement download');
requireIncludes('bespoke street furniture capability', 'Bespoke street furniture and public art');
requireIncludes('premium paving capability', 'Premium paving and architectural cladding');
requireIncludes('advanced stone machining capability', 'Advanced stone machining');
requireIncludes('multi-material assemblies capability', 'Multi-material assemblies');
requireIncludes('design technical service capability', 'Design and technical service');
requireIncludes('lifecycle support section', 'From the first sketch to the tenth-year visit.');
requireIncludes('national reach section', 'Melbourne-based. Working Australia-wide.');
requireIncludes('selected project proof section', 'Selected project proof');
requireIncludes('project proof ledger', 'projectLedger');
requireIncludes('West Side Place project proof', 'West Side Place');
requireIncludes('Moon Gate project proof', 'Moon Gate | Woolley Street');
requireIncludes('Greenline project proof', 'Greenline');
requireIncludes('Bundha Sport Centre project proof', 'Bundha Sport Centre');

if (!submitSource.includes('/api/enquiries')) {
  failures.push('Capabilities download form must submit to /api/enquiries.');
}

if (/mailto:|window\.location\.href|location\.href|location\.assign|location\.replace/.test(submitSource)) {
  failures.push('Capabilities download submit flow must not fall back to mailto or window navigation.');
}

requireRegex('email validation before submit', /isEmail\(normalizedEmail\)/);
requireRegex('source route included in payload', /const sourceRoute = `\$\{window\.location\.pathname\}\$\{window\.location\.search\}`/);
requireRegex('Turnstile token included in submit payload', /turnstileToken:\s*turnstileToken\s*\|\|\s*undefined/);
requireRegex(
  'submit blocks when configured Turnstile has no token',
  /isTurnstileEnabled\s*&&\s*!turnstileToken[\s\S]*?setMessage\(/,
);

const requiredAssets = [
  'public/downloads/urblo-capability-statement-2026.pdf',
  'public/media/launch/capabilities/factory-preassembly.jpg',
  'public/media/launch/capabilities/west-side-place-aerial.jpg',
  'public/media/launch/capabilities/site-install-review.jpg',
  'public/media/launch/capabilities/curved-stone-preassembly.jpg',
  'public/media/launch/capabilities/moon-gate-framed-view.jpg',
  'public/media/launch/our-story/natalie-ma-2026.jpg',
];

for (const asset of requiredAssets) {
  if (!fs.existsSync(asset)) {
    failures.push(`Missing Capability Statement asset: ${asset}`);
  }
}

if (failures.length) {
  console.error('Capabilities page source contract checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Capabilities page source contract checks passed.');
