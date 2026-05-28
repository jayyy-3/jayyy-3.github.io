#!/usr/bin/env node
import fs from 'node:fs';

const contactSource = fs.readFileSync('src/pages/ContactPage.tsx', 'utf8');

const failures = [];

function requireIncludes(label, value) {
  if (!contactSource.includes(value)) {
    failures.push(`Contact form source is missing ${label}: ${value}`);
  }
}

function requireRegex(label, regex) {
  if (!regex.test(contactSource)) {
    failures.push(`Contact form source is missing ${label}.`);
  }
}

const submitStart = contactSource.indexOf('async function handleSubmit');
const submitEnd = contactSource.indexOf('\n  return (', submitStart);
const submitSource =
  submitStart >= 0 && submitEnd > submitStart
    ? contactSource.slice(submitStart, submitEnd)
    : '';

if (!submitSource) {
  failures.push('Contact form source is missing handleSubmit implementation.');
}

for (const endpoint of ['/api/enquiries', '/api/sample-requests']) {
  if (!submitSource.includes(endpoint)) {
    failures.push(`Contact form submit flow is missing endpoint ${endpoint}.`);
  }
}

if (/mailto:|window\.location\.href|location\.href|location\.assign|location\.replace/.test(submitSource)) {
  failures.push('Contact form submit flow must not fall back to mailto or window navigation.');
}

requireIncludes(
  'project enquiry validation copy',
  'Add your name, email, and project notes before sending the enquiry.',
);
requireIncludes(
  'sample request validation copy',
  'Add the sample preference and shipping address before sending the request.',
);
requireIncludes(
  'project enquiry success copy',
  'Project enquiry received. Urblo will review the brief and respond with practical next steps.',
);
requireIncludes(
  'sample request success copy',
  'Sample request received. Urblo will confirm availability and next steps.',
);
requireIncludes(
  'server failure fallback copy',
  'The request could not be submitted. Please contact Urblo directly.',
);
requireIncludes(
  'secure storage visitor note',
  'This stores the brief securely for Urblo. Direct email and phone remain available',
);
requireIncludes('direct email fallback channel', 'href="mailto:info@urblo.com.au?subject=Contact%20Us"');
requireIncludes('direct phone fallback channel', 'href="tel:1300187256"');

requireRegex('inline success status region', /role="status"[\s\S]*?\{successMessage\}/);
requireRegex('inline error alert region', /id="contact-form-error"[\s\S]*?role="alert"[\s\S]*?\{formError\}/);
requireRegex('submit disabled while submitting', /disabled=\{submissionStatus === 'submitting'\}/);
requireRegex('submitting button copy', /submissionStatus === 'submitting'[\s\S]*?\?\s*'Sending\.\.\.'/);
requireRegex(
  'sample request mode from query string',
  /searchParams\.get\('intent'\) === 'sample-request'[\s\S]*?'Sample request'/,
);
requireRegex('sample request fields render only in sample mode', /isSampleRequest \? \([\s\S]*contact-sample-stone/);
requireRegex('sample request shipping field', /id="contact-shipping-address"[\s\S]*required=\{isSampleRequest\}/);
requireRegex('source route included in payload', /const sourceRoute = `\$\{window\.location\.pathname\}\$\{window\.location\.search\}`/);

if (failures.length) {
  console.error('Contact form UI source contract checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Contact form UI source contract checks passed.');
