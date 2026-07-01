# OPERATING_PROTOCOL — Urblo Working Agreement

Last updated: 2026-06-30

## Purpose
This is the session-level operating contract for how the Urblo site is changed and how its design stays consistent. It sits **on top of** the existing agent harness (`AGENTS.md` and the docs it points to) and makes two things explicit:

1. **Delivery** — a container-first, test-gated workflow so nothing reaches production untested.
2. **Design** — a review → implement → remember loop so the UI keeps reinforcing Urblo's identity instead of drifting toward a generic template.

It governs **process**. It does not replace the content authorities: `docs/ARCHITECTURE.md` (technical contracts), `docs/brand-baseline.md` (brand), `docs/DESIGN.md` (visual/UX), and `docs/HANDOFF.md` (current state/next action) remain authoritative for their domains.

## Kick-start — read this first, every session
At the start of any Urblo work session, the agent must:
1. Read this file (`docs/OPERATING_PROTOCOL.md`).
2. Read `AGENTS.md`, `docs/HANDOFF.md`, and `docs/agent/status.json` for current state.
3. Announce it is operating under this protocol (container-gated delivery + design loop).

A Claude memory hook triggers this automatically. If you are an agent reading this without that hook, follow it anyway.

---

## Pillar 1 — Delivery Protocol (container-first, test-gated)

**Hard rule: no change reaches production untested.** Every change flows left-to-right and **STOPS at any red gate**.

```
feature branch
   │
   ▼  ① LOCAL CONTAINER GATE  — npm run gate   (must be green)
   │     build · lint · typecheck (tsc -b) · agent:smoke, in a clean Node 20 container
   ▼  ② push branch  →  Cloudflare Pages auto-builds a PREVIEW
   │
   ▼  ③ PREVIEW SMOKE  — npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev
   │                                            (must be green)
   ▼  ④ promote to main (merge)  →  Cloudflare auto-deploys PRODUCTION (+ legacy GitHub Pages)
```

Rules:
- **Never commit directly to `main`.** Work on a branch. `main` always stays green and deployable — a push to it ships to production.
- **No push until gate ① is green.** `npm run gate` builds `Dockerfile.gate`; the gates run as build steps, so a red gate fails `docker build`.
- The container gate is **source-only and needs no secrets.**
- Host-equivalent fallback when Docker is unavailable: `npm run build` · `npm run lint` · `npx tsc -b` · `npm run agent:smoke`. Prefer the container so the check is identical on every machine.

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

---

## Reference map — where truth lives
| File | Authority over |
|---|---|
| `docs/OPERATING_PROTOCOL.md` (this) | Working process: delivery gates + design loop |
| `AGENTS.md` | Agent entry, repo contracts, gate command index |
| `docs/HANDOFF.md` | Current state + next recommended action |
| `docs/agent/status.json` / `tasks.json` | Compact machine state / task queue |
| `docs/ARCHITECTURE.md` | Technical, route, data, deploy contracts |
| `docs/DESIGN.md` | Visual / UX execution |
| `docs/brand-baseline.md` | Brand, positioning, voice, claims |
| `docs/WORKLOG.md` | Historical evidence |

## Change log
- **2026-06-30** — Initial operating protocol: added the container gate (`npm run gate` → `Dockerfile.gate`), the test-gated delivery flow, the design review → implement → remember loop, and the session kick-start hook.
