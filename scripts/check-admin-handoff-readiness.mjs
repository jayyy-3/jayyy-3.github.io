#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { cwd, exit } from 'node:process';
import { join } from 'node:path';
import {
  isValidBaseUrlOrigin,
  isValidEmail,
} from './_lib/live-input-validation.mjs';

const root = cwd();

function parseArgs(argv) {
  const options = {
    adminEmail: '',
    baseUrl: '',
    strict: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--strict') {
      options.strict = true;
      continue;
    }

    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.slice('--base-url='.length);
      continue;
    }

    if (arg === '--admin-email') {
      options.adminEmail = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--admin-email=')) {
      options.adminEmail = arg.slice('--admin-email='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function readRequiredFile(path, failures) {
  const absolutePath = join(root, path);
  if (!existsSync(absolutePath)) {
    failures.push(`missing required file: ${path}`);
    return '';
  }
  return readFileSync(absolutePath, 'utf8');
}

function includesAll(label, text, required, failures) {
  for (const phrase of required) {
    if (!text.includes(phrase)) {
      failures.push(`${label} missing required handoff phrase: ${phrase}`);
    }
  }
}

function excludesAll(label, text, forbidden, failures) {
  for (const phrase of forbidden) {
    if (text.includes(phrase)) {
      failures.push(`${label} still contains technical handoff phrase: ${phrase}`);
    }
  }
}

function makeCheck(label, ready, detail) {
  return { label, ready, detail };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const failures = [];
  const checks = [];

  const pkgText = readRequiredFile('package.json', failures);
  const editorGuide = readRequiredFile('docs/ADMIN_EDITOR_GUIDE.md', failures);
  const walkthrough = readRequiredFile('docs/ADMIN_PRODUCTION_WALKTHROUGH.md', failures);
  const worklog = readRequiredFile('docs/WORKLOG.md', failures);
  readRequiredFile('docs/HANDOFF.md', failures);
  readRequiredFile('docs/NEXT_STEPS.md', failures);
  readRequiredFile('docs/agent/tasks.json', failures);

  if (pkgText) {
    const pkg = JSON.parse(pkgText);
    const script = pkg.scripts?.['agent:admin-handoff-readiness'];
    if (script !== 'node scripts/check-admin-handoff-readiness.mjs') {
      failures.push('package.json must expose agent:admin-handoff-readiness.');
    }
  }

  includesAll(
    'docs/ADMIN_EDITOR_GUIDE.md',
    editorGuide,
    [
      'One-Page Editor Handoff',
      'Admin address: `https://urblo.com.au/admin`.',
      'Account setup: a Website owner or CMS manager invites the editor from Settings, People and access, using the lowest useful role.',
      'Start screen: Dashboard shows Recommended next action, What the website can show now, and the Content health queue.',
      'Find content: open the relevant module, then use search and status filters before selecting an item.',
      'Publish carefully: Published can appear on the public website. Publish only when the checklist is clear.',
      'CMS coverage: Projects, Stone Library, Products, Articles, Media, Leads, Settings, and Change history are in the CMS.',
      'Imported content: Projects, Stone Library, Products, Articles, and Media candidates are already in the CMS as Draft items.',
      'Static fallback: public pages still keep static fallback content where needed, so Draft and Archived CMS content remains hidden.',
    ],
    failures,
  );

  includesAll(
    'docs/ADMIN_PRODUCTION_WALKTHROUGH.md',
    walkthrough,
    [
      'Results Template',
      '| Area | Result | Evidence | Changes Made | Public URL / Screenshot | Follow-up |',
      'Result values:',
      'Final Handoff Decision',
      'Active-admin browser QA passes on `https://urblo.com.au`.',
      'The walkthrough above passes with production evidence.',
    ],
    failures,
  );

  excludesAll(
    'docs/ADMIN_PRODUCTION_WALKTHROUGH.md',
    walkthrough,
    [
      'Draft rows',
      'saved rows',
      'Supabase Auth',
      'profile rows',
      'claim_status',
      'raw imported HTML or JSON',
      'database rows',
    ],
    failures,
  );

  const baseUrlReady = isValidBaseUrlOrigin(options.baseUrl);
  const adminEmailReady = isValidEmail(options.adminEmail);
  const productionResultsReady =
    /## Entry - .*\(Admin CMS Production Walkthrough Results\)/.test(worklog) &&
    /\| Final editor handoff \| Pass \|/.test(worklog);

  checks.push(
    makeCheck(
      'Production origin input',
      baseUrlReady,
      baseUrlReady ? '--base-url is a valid origin.' : 'Pass --base-url https://urblo.com.au before final handoff.',
    ),
    makeCheck(
      'First admin input',
      adminEmailReady,
      adminEmailReady ? '--admin-email is valid.' : 'Pass --admin-email info@urblo.com.au before final handoff.',
    ),
    makeCheck(
      'Production walkthrough evidence',
      productionResultsReady,
      productionResultsReady
        ? 'WORKLOG contains Admin CMS Production Walkthrough Results with Final editor handoff marked Pass.'
        : 'Missing production walkthrough results in WORKLOG. Copy the Results Template after deployment and mark Final editor handoff as Pass only with evidence.',
    ),
  );

  const blockingFailures = [
    ...failures,
    ...checks.filter((check) => !check.ready).map((check) => check.detail),
  ];

  console.log('Admin CMS handoff readiness audit.');
  console.log('No deployment, Supabase writes, browser login, or live content changes were attempted.');
  console.log('');

  for (const check of checks) {
    console.log(`[${check.ready ? 'ready' : 'missing'}] ${check.label}`);
    console.log(`  ${check.detail}`);
  }

  if (failures.length) {
    console.log('');
    console.log('Source/documentation blockers:');
    for (const failure of failures) console.log(`- ${failure}`);
  }

  if (blockingFailures.length) {
    console.log('');
    console.log('Admin CMS handoff is not proven complete yet.');
    if (options.strict) exit(1);
    console.log('Report-only mode: use --strict to fail until production walkthrough evidence exists.');
    return;
  }

  console.log('');
  console.log('Admin CMS handoff evidence is complete.');
}

main();
