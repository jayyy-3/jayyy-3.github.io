# Agent harness contract

Where agent state, tasks and release evidence live. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Agent Harness Contract

`docs/agent/status.json` owns timestamped release/environment observations; `docs/agent/tasks.json` owns execution scope and blockers. HANDOFF, NEXT_STEPS and README summaries are generated. Use `docs/OPERATING_PROTOCOL.md`, `docs/agent/verification.md` and `docs/PROJECT_MAP.md` for workflow, checks and module discovery. Archived startup instructions and old release assertions are not active rules.

## Release evidence

Timestamped release observations are maintained in `docs/agent/status.json`; verification history is indexed by `docs/WORKLOG.md`. Do not infer a current passing gate from old prose.
