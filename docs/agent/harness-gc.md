# Harness GC

Last updated: 2026-09-09

Run `npm run agent:harness-gc` for read-only state validation; `npm run agent:harness-gc:review` also writes an ignored report. GC does not change task status, approval, verification dates or production. `--fix` now refuses automatic date-refresh because a new date cannot prove a fact.

Blocking checks: schema versions, current task identity, active/done separation, blocked reason, module paths, release SHA/URL shape, CMS state equality with structured handoff evidence, shared-production Preview read-only policy, generated summary equality, root/startup byte budgets, and lossless historical archive checksums.

`npm run agent:state` regenerates summaries after an intentional canonical state update. `npm run agent:state:check` injects conflicting task/CMS/Preview/README/HANDOFF examples to prove rejection. Historical evidence remains accessible through `docs/WORKLOG.md`; completed tasks retain IDs in the archive.

The command registry is package.json; the module-to-check map is `docs/agent/modules.json`. A script need not be copied into every instruction document to be discoverable.
