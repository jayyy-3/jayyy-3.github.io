# OPERATING_PROTOCOL — Urblo Working Agreement

Last updated: 2026-06-30
In `AGENTS.md` -> Canonical Conflict Precedence, this file is authoritative for working process; `AGENTS.md` remains the root entry point.

## Purpose
This is the session-level operating contract for how the Urblo site is changed and how its design stays consistent. It sits **on top of** the existing agent harness (`AGENTS.md` and the docs it points to) and makes two things explicit:

1. **Delivery** — a container-first, test-gated workflow so nothing reaches production untested.
2. **Design** — a review → implement → remember loop so the UI keeps reinforcing Urblo's identity instead of drifting toward a generic template.

It governs **process**. It does not replace the content authorities: `docs/ARCHITECTURE.md` (technical contracts), `docs/brand-baseline.md` (brand), `docs/DESIGN.md` (visual/UX), and `docs/HANDOFF.md` (current state/next action) remain authoritative for their domains.

## Kick-start — every session
At the start of any Urblo work session, the agent must:
1. Read `AGENTS.md` (the root harness entry), then this file.
2. Read `docs/HANDOFF.md` and `docs/agent/status.json` for current state.
3. Announce it is operating under this protocol (container-gated delivery + design loop).

A machine-local Claude memory hook on Hunter's machine triggers this automatically; that hook is **not** part of the repo. Agents on any other machine reach this file through the `AGENTS.md` Working Process pointer and must follow this section manually.

---

## Pillar 1 — Delivery Protocol (container-first, test-gated)

**Hard rule: no change reaches production untested.** Every change flows left-to-right and **STOPS at any red gate**.

```
feature branch
   │
   ▼  ① LOCAL CONTAINER GATE  — npm run gate   (must be green)
   │     git diff --check (host) + build (incl. tsc -b) · lint · agent:smoke · agent:check,
   │     in a clean Node 20 container
   ▼  ② push branch  →  Cloudflare Pages auto-builds a PREVIEW
   │
   ▼  ③ PREVIEW SMOKE  — npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev
   │                                            (must be green)
   ▼  ④ promote to main (merge)  →  Cloudflare auto-deploys PRODUCTION (+ legacy GitHub Pages)
```

Rules:
- **Never commit directly to `main`.** Work on a branch. `main` always stays green and deployable — a push to it ships to production.
- **No push until gate ① is green.** `npm run gate` builds `Dockerfile.gate`; the gates run as build steps, so a red gate fails `docker build`.
- **The gate validates the working tree**, untracked files included — not the commit you push. Commit everything before pushing so the green result describes the pushed commit; the gate script warns when the tree is dirty.
- The container gate is **source-only and needs no secrets**; `.dockerignore` keeps `.env*`, `.dev.vars`, and `*.local` out of the image so the build stays env-less like the Cloudflare Pages build.
- **Admin-CMS stack changes** additionally require `npm run agent:admin-cms-predeploy` and `npm run agent:admin-config-gate` before deploy (`AGENTS.md` startup checklist step 17).
- **Node parity:** the gate image, `.github/workflows/deploy.yml`, and the host all track Node 20; bump them together. Cloudflare Pages should pin `NODE_VERSION=20` in project settings.
- Host-equivalent fallback when Docker is unavailable: `npm run build` · `npm run lint` · `npm run agent:smoke` · `npm run agent:check` · `git diff --check`. Prefer the container so the check is identical on every machine.

**Approval-gated actions** — never run without explicit, fresh approval for the specific action (this matches the harness):
- Live form writes (`agent:forms-live -- --allow-writes`), admin invites / first-admin writes, publishing or merging CMS content, and anything that mutates real Supabase data, Cloudflare config, or DNS.

**Secrets:** never commit them. Live checks read env from `.env.local` / `.env` / `.dev.vars` / shell only.

---

## Pillar 2 — Design Protocol (review → implement → remember)

**Goal:** every change that touches UI, copy claims, or page composition reinforces Urblo's identity.

**Authorities (this loop *uses* them, it does not duplicate them):**
- `docs/brand-baseline.md` — what Urblo *means* (positioning, voice, claims, audience). Authoritative for brand.
- `docs/DESIGN.md` — how it should *feel* (composition, density, imagery, interaction). Authoritative for visual/UX.

**The loop, for any UI / claim / composition change:**
1. **Review (before building)** — check the change against the Design Review Checklist below and brand guardrails. If it fails a principle, redesign *before* writing code.
2. **Implement** — build to the contract; reuse existing components and patterns.
3. **Remember** — capture any *new* design decision or feedback so it persists:
   - Update `docs/DESIGN.md` (and/or `docs/brand-baseline.md`) per the `AGENTS.md` "When Docs Must Be Updated" rule.
   - Record durable user preferences/feedback into Claude memory (feedback type) for cross-session recall.
4. **Verify** — ship with a one-line brand/design-alignment note, then run the Pillar 1 gates.

**Design Review Checklist** (distilled from `docs/DESIGN.md` — that file remains the full contract):
- **Decision surface, not brochure** — does it help a real project decision (can this material work? what finish changes its behavior? how is it delivered? what proof exists? what next?).
- **Beauty lands in buildability** — visual polish points to fabrication, detailing, install, sourcing, or proof — otherwise tighten or replace it.
- **Stone is inspectable** — imagery shows context, use, or texture; no dark overlays / vague crops / tiny thumbnails that hide the material.
- **Professional density** — tool pages stay compact and scannable; whitespace creates hierarchy, not filler.
- **Trust from constraints** — project-conditional claims (lead time, cost saving, slip rating, carbon, origin, tolerances) show their condition; nothing universalized.
- **Calm confidence** — contemporary, disciplined, precise, quietly bold. Not a luxury catalogue; not a generic supplier page.

This checklist is a convenience summary. `docs/DESIGN.md` wins on any conflict, and when its principles change, update this checklist in the same change.

---

## Where truth lives
The per-domain authority map is owned by `AGENTS.md` -> "Canonical Conflict Precedence" — it is not duplicated here. This file adds exactly one row to that map: **working process** (delivery gates, session kick-start, design loop) -> `docs/OPERATING_PROTOCOL.md`.

## Change log
- **2026-06-30** — Review fixes after the 8-angle setup review: gate excludes env/secret files from the image, `agent:check` + `git diff --check` join gate ①, dropped the no-op separate tsc step, working-tree-vs-commit caveat, admin-CMS predeploy branch, Node 20 parity across gate/deploy.yml, honest machine-local wording for the memory hook, precedence row added in `AGENTS.md`, authority table replaced with a pointer, gate registered in `check-harness.mjs`.
- **2026-06-30** — Initial operating protocol: added the container gate (`npm run gate` → `Dockerfile.gate`), the test-gated delivery flow, the design review → implement → remember loop, and the session kick-start hook.
