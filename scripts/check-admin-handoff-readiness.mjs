#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { cwd, exit } from 'node:process';
import { isAbsolute, join, relative, resolve } from 'node:path';
import {
  isValidBaseUrlOrigin,
  isValidEmail,
} from './_lib/live-input-validation.mjs';

const root = cwd();
const requiredWorkflowKeys = [
  'authenticatedSignIn',
  'draftSaveRefresh',
  'privateMediaPublish',
  'publishedPublicReadback',
  'archivePublicReadback',
  'settingsPublicReadback',
  'inviteSetPassword',
  'passwordRecovery',
  'responsiveAdminNavigation',
  'projectsTaskWorkspace',
  'dashboardOperationalQueue',
  'editorGuideUsability',
];
const requiredProductionPrerequisiteKeys = ['mediaPublicBucketRoleBoundary'];
const requiredMediaRoleMigration = '20260713065628_media_public_bucket_role_hardening.sql';
const maximumEvidenceWindowMs = 7 * 24 * 60 * 60 * 1000;

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

function parseJsonFile(label, text, failures) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

function isDeploymentPreviewUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname.endsWith('.urblo.pages.dev') &&
      url.hostname !== 'urblo.pages.dev' &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function isLocalGitCommit(value) {
  if (!/^[0-9a-f]{7,40}$/i.test(value || '')) return false;

  return spawnSync('git', ['cat-file', '-e', `${value}^{commit}`], {
    cwd: root,
    stdio: 'ignore',
  }).status === 0;
}

function isRepoEvidenceRef(value) {
  if (typeof value !== 'string' || !value.trim()) return false;

  const [relativePath] = value.split('#');
  if (!relativePath || isAbsolute(relativePath)) return false;

  const absolutePath = resolve(root, relativePath);
  const pathFromRoot = relative(root, absolutePath);
  if (!pathFromRoot || pathFromRoot.startsWith('..') || isAbsolute(pathFromRoot)) return false;

  try {
    if (!lstatSync(absolutePath).isFile()) return false;
  } catch {
    return false;
  }

  return spawnSync('git', ['ls-files', '--error-unmatch', '--', pathFromRoot], {
    cwd: root,
    stdio: 'ignore',
  }).status === 0;
}

function isAllowedEvidenceRef(value, deploymentUrl) {
  if (typeof value !== 'string' || !value.trim()) return false;

  try {
    const url = new URL(value);
    const deploymentOrigin = normalizeOrigin(deploymentUrl);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      Boolean(deploymentOrigin) &&
      url.origin === deploymentOrigin
    );
  } catch {
    return isRepoEvidenceRef(value);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractGoldenEvidenceSections(text) {
  const headings = [...text.matchAll(/^### Admin CMS Golden Workflow Evidence[ \t]*$/gm)];

  return headings.map((heading) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const remainder = text.slice(start);
    const nextHeading = remainder.match(/^#{1,3}\s+\S.*$/m);
    const end = nextHeading?.index === undefined ? text.length : start + nextHeading.index;
    return text.slice(start, end);
  });
}

function workflowRowEvidence(section, workflowKey) {
  const row = section.match(
    new RegExp(`^\\|\\s*${escapeRegExp(workflowKey)}\\s*\\|\\s*Pass\\s*\\|\\s*(.*?)\\s*\\|\\s*$`, 'm'),
  );
  return row?.[1] || '';
}

function prerequisiteRowEvidence(section, prerequisiteKey) {
  const row = section.match(
    new RegExp(`^\\|\\s*${escapeRegExp(prerequisiteKey)}\\s*\\|\\s*Pass\\s*\\|\\s*(.*?)\\s*\\|\\s*$`, 'm'),
  );
  return row?.[1] || '';
}

function findMatchingGoldenEvidenceSection(worklog, evidence) {
  if (!evidence?.deploymentSha || !evidence?.deploymentUrl) return null;

  const shaLine = `Deployment SHA: \`${evidence.deploymentSha}\``;
  const urlLine = `Deployment URL: \`${evidence.deploymentUrl}\``;

  return extractGoldenEvidenceSections(worklog).find((section) => {
    if (!section.includes(shaLine) || !section.includes(urlLine)) return false;

    const workflowsMatch = requiredWorkflowKeys.every((key) => {
      const rowEvidence = workflowRowEvidence(section, key);
      const refs = evidence.workflows?.[key]?.evidenceRefs;
      return (
        Boolean(rowEvidence) &&
        Array.isArray(refs) &&
        refs.length > 0 &&
        refs.every((reference) => rowEvidence.includes(reference))
      );
    });

    const prerequisitesMatch = requiredProductionPrerequisiteKeys.every((key) => {
      const rowEvidence = prerequisiteRowEvidence(section, key);
      const refs = evidence.productionPrerequisites?.[key]?.evidenceRefs;
      return (
        Boolean(rowEvidence) &&
        Array.isArray(refs) &&
        refs.length > 0 &&
        refs.every((reference) => rowEvidence.includes(reference))
      );
    });

    return workflowsMatch && prerequisitesMatch;
  }) || null;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const failures = [];
  const checks = [];

  const pkgText = readRequiredFile('package.json', failures);
  const editorGuide = readRequiredFile('docs/ADMIN_EDITOR_GUIDE.md', failures);
  const walkthrough = readRequiredFile('docs/ADMIN_PRODUCTION_WALKTHROUGH.md', failures);
  const worklog = readRequiredFile('docs/WORKLOG.md', failures);
  const evidenceText = readRequiredFile('docs/agent/admin-handoff-evidence.json', failures);
  const evidence = parseJsonFile('docs/agent/admin-handoff-evidence.json', evidenceText, failures);
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
      'Static fallback: Draft and Archived CMS versions remain hidden, but a matching legacy static page can stay visible during migration until CMS-only cutover is approved.',
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
      '| mediaPublicBucketRoleBoundary | Pending |',
      '| responsiveAdminNavigation | Pending |',
      '| projectsTaskWorkspace | Pending |',
      '| dashboardOperationalQueue | Pending |',
      '| editorGuideUsability | Pending |',
      'Admin Navigation Widths',
      'Editor Guide Usability',
    ],
    failures,
  );

  excludesAll(
    'docs/ADMIN_PRODUCTION_WALKTHROUGH.md',
    walkthrough,
    [
      'Draft rows',
      'saved rows',
      'profile rows',
      'claim_status',
      'raw imported HTML or JSON',
      'database rows',
    ],
    failures,
  );

  const baseUrlReady = isValidBaseUrlOrigin(options.baseUrl);
  const adminEmailReady = isValidEmail(options.adminEmail);
  const evidenceStateReady =
    evidence?.version === 2 &&
    evidence?.state === 'verified' &&
    evidence?.environment === 'production' &&
    normalizeOrigin(evidence?.baseUrl) === normalizeOrigin(options.baseUrl);
  const evidenceDeploymentReady = isLocalGitCommit(evidence?.deploymentSha);
  const evidenceDeploymentUrlReady = isDeploymentPreviewUrl(evidence?.deploymentUrl || '');
  const verifiedAt = Date.parse(evidence?.verifiedAt || '');
  const expiresAt = Date.parse(evidence?.expiresAt || '');
  const evidenceFresh =
    Number.isFinite(verifiedAt) &&
    Number.isFinite(expiresAt) &&
    verifiedAt <= Date.now() &&
    Date.now() - verifiedAt <= maximumEvidenceWindowMs &&
    expiresAt > Date.now() &&
    expiresAt > verifiedAt &&
    expiresAt - verifiedAt <= maximumEvidenceWindowMs;
  const evidenceAdminReady =
    adminEmailReady &&
    typeof evidence?.verifiedAdminEmail === 'string' &&
    evidence.verifiedAdminEmail.trim().toLowerCase() === options.adminEmail.trim().toLowerCase();
  const missingWorkflows = requiredWorkflowKeys.filter((key) => {
    const workflow = evidence?.workflows?.[key];
    return (
      workflow?.status !== 'passed' ||
      !Array.isArray(workflow?.evidenceRefs) ||
      workflow.evidenceRefs.length === 0 ||
      workflow.evidenceRefs.some((reference) => !isAllowedEvidenceRef(reference, evidence?.deploymentUrl))
    );
  });
  const workflowEvidenceReady = missingWorkflows.length === 0;
  const missingProductionPrerequisites = requiredProductionPrerequisiteKeys.filter((key) => {
    const prerequisite = evidence?.productionPrerequisites?.[key];
    const hasRequiredMigration =
      key !== 'mediaPublicBucketRoleBoundary' ||
      prerequisite?.migration === requiredMediaRoleMigration;
    return (
      prerequisite?.status !== 'passed' ||
      !hasRequiredMigration ||
      !Array.isArray(prerequisite?.evidenceRefs) ||
      prerequisite.evidenceRefs.length === 0 ||
      prerequisite.evidenceRefs.some(
        (reference) => !isAllowedEvidenceRef(reference, evidence?.deploymentUrl),
      )
    );
  });
  const productionPrerequisitesReady = missingProductionPrerequisites.length === 0;
  const matchingGoldenEvidenceSection = findMatchingGoldenEvidenceSection(worklog, evidence);
  const worklogGoldenEvidenceReady = Boolean(
    evidenceDeploymentReady &&
    evidenceDeploymentUrlReady &&
    matchingGoldenEvidenceSection,
  );

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
      'Structured production evidence state',
      evidenceStateReady,
      evidenceStateReady
        ? 'Machine evidence is verified for the requested production origin.'
        : 'docs/agent/admin-handoff-evidence.json must be version 2, production, state=verified, and match --base-url.',
    ),
    makeCheck(
      'Verified deployment identity',
      evidenceDeploymentReady,
      evidenceDeploymentReady
        ? `Evidence is tied to deployment ${evidence.deploymentSha}.`
        : 'Record a deployed commit SHA that exists in the local Git repository and received the browser walkthrough.',
    ),
    makeCheck(
      'Immutable deployment URL',
      evidenceDeploymentUrlReady,
      evidenceDeploymentUrlReady
        ? `Evidence names deployment preview ${evidence.deploymentUrl}.`
        : 'Record the unique https://<deployment>.urblo.pages.dev URL, not only the moving production alias.',
    ),
    makeCheck(
      'Fresh evidence window',
      evidenceFresh,
      evidenceFresh
        ? `Evidence is valid until ${evidence.expiresAt}.`
        : 'Record verifiedAt and expiresAt within the same seven-day window so stale walkthroughs cannot pass indefinitely.',
    ),
    makeCheck(
      'Verified admin identity',
      evidenceAdminReady,
      evidenceAdminReady
        ? 'The evidence admin matches --admin-email.'
        : 'Record the admin email used for the walkthrough and make it match --admin-email.',
    ),
    makeCheck(
      'Golden workflow evidence',
      workflowEvidenceReady,
      workflowEvidenceReady
        ? 'All required browser workflows passed with evidence references.'
        : `Missing passed evidence tied to a Git-tracked repo file or the immutable deployment origin for: ${missingWorkflows.join(', ')}.`,
    ),
    makeCheck(
      'Production role-boundary prerequisites',
      productionPrerequisitesReady,
      productionPrerequisitesReady
        ? 'The required Storage migration and live Editor/owner role-boundary proof are recorded.'
        : `Missing applied-migration and live role-boundary evidence for: ${missingProductionPrerequisites.join(', ')}.`,
    ),
    makeCheck(
      'WORKLOG golden workflow record',
      worklogGoldenEvidenceReady,
      worklogGoldenEvidenceReady
        ? 'One WORKLOG golden-evidence section ties the deployment SHA, immutable URL, prerequisite/workflow Pass rows, and JSON evidence references together.'
        : 'Add one Admin CMS Golden Workflow Evidence section with the same deployment SHA/URL and one Pass row that cites every JSON evidence reference for each production prerequisite and workflow.',
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
    console.log('');
    console.log('Admin CMS predeploy source checks failed.');
    exit(1);
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
