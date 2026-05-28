# Urblo Design Contract

Last updated: 2026-05-28

## Purpose
This document governs Urblo's visual and UX execution. It is the design contract for Codex work in this repository.

Use this file when deciding:
- page composition
- layout density
- typography scale
- image treatment
- component styling
- interaction tone
- responsive behavior
- whether a page feels like Urblo or like a generic template

This file does not replace `docs/brand-baseline.md`. The brand baseline defines what Urblo means. This file defines how that meaning should feel in the interface.

## Source Material
- `docs/brand-baseline.md`
- Prior website design discussion archive reviewed while authoring this contract: workflowy notes, website Q&A draft, newsletters, and sales emails. These are source references, not canonical repo files.
- Current React implementation and user feedback from Stone Library, Contact, and Our Story work.

## Design North Star
Urblo should feel like calm confidence: contemporary, disciplined, precise, and quietly bold.

The site is not a luxury stone catalogue and not a generic construction supplier page. It is a professional decision surface for landscape architects, contractors, councils, and project teams who need stone to become predictable, buildable, and inspectable.

Every design choice should reinforce this equation:

`design intent + material intelligence + engineering proof = confident project decisions`

## Core Experience Principles

### 1. Make Decisions Faster, Safer, and More Certain
Every page should reduce friction for a real project decision:
- Can this material work?
- What finish changes its behavior?
- How is this delivered?
- What proof exists?
- What should I do next?

Do not design passive brochure sections when a focused decision surface would help more.

### 2. Beauty Must Land in Buildability
Visual polish is only on-brand when it points to fabrication, detailing, installation, sourcing, or proof. If a section is beautiful but does not clarify how Urblo works, tighten it or replace it with evidence.

### 3. Stone Must Be Inspectable
Images are not decoration. They should show at least one of:
- context: scale, public realm, site condition
- use: people, seating, walking, civic life, movement
- texture: finish, edge, grain, color variation, surface behavior

Stone Library and material pages require inspectable texture first. Dark overlays, vague atmospheric crops, and tiny thumbnails are off-brand when they hide the material.

### 4. Professional Density Beats Empty Drama
Editorial pages can breathe. Tool pages should be compact and scannable.

Use whitespace to create hierarchy, not to inflate weak content. Avoid oversized sections where the user has to scroll past empty space to reach proof, filters, specs, or contact actions.

### 5. Trust Comes from Constraints
When a claim depends on project conditions, show the condition. Avoid universalizing project-specific notes. This is especially important for:
- lead times
- cost savings
- slip ratings
- carbon claims
- origin and sourcing
- installation gaps or tolerances
- "standard" dimensions

## Visual System

### Palette
Primary palette:
- Ink: `#000000`
- Body text: `#33363F`
- Accent signal: `#00FF19`
- Neutral surfaces: white, near-white, pale grey, charcoal

Use the neon green as a signal, not as decoration. It should mark active states, key proof, small labels, and decisive CTAs. Large green fields should be rare.

Avoid:
- broad decorative gradients
- generic blue SaaS palettes
- warm beige lifestyle palettes
- heavy dark-blue/slate dashboards
- color systems that overpower stone texture

### Typography
Known brand typography:
- Primary: `Avenir LT Std`
- Display: `Space Grotesk`
- Accent serif: `Didot LT Std`

Rules:
- Public page-level H1 typography follows the Projects page pattern: `Avenir LT Std`, light `300`, normal letter spacing, no forced uppercase.
- Use display-scale type only for true hero or editorial moments.
- Tool surfaces need smaller, tighter headings.
- Keep body copy highly readable; do not rely on thin/light type on low-contrast backgrounds.
- Avoid negative letter spacing.
- Do not scale font size with viewport width.

### Layout
Rules:
- Use full-width sections or clean constrained layouts.
- Use cards for repeated items, modals, and framed tools only.
- Do not nest cards inside cards.
- Keep cards at 8px radius or less unless an existing component pattern requires otherwise.
- Stabilize fixed-format UI with clear dimensions, aspect ratios, grid tracks, or min/max constraints.
- Avoid empty route banners, oversized placeholders, and template-like hero blocks.

### Imagery
Rules:
- Product and material pages should reveal the actual object or material.
- Project pages should show real context before abstract detail.
- Finish imagery should be large enough to compare texture.
- Missing images should degrade quietly with an explicit material-placeholder state.
- Do not let overlays, captions, or labels block the texture being inspected.

## Page Archetypes

### Home
The homepage should introduce Urblo as a design-led, engineering-backed stone solution partner.

Priorities:
- clear proposition
- proof of capability
- visible project/material pathways
- sustainability and pre-assembly framed with evidence
- low-friction next steps

Avoid making it feel like a generic landing page with decorative cards and abstract claims.

Current launch rhythm:
- The proof metrics section sits immediately after the full-viewport hero.
- Its approved copy is `Stone has always shaped cities.` followed by `We shape how stone is designed, specified, and delivered.`
- The proof section may include a lightweight `Our Capabilities` CTA under the intro copy. It should feel like a quiet design-system control, not a heavy sales button.
- The old sustainability/tabbed feature section should stay out of the rendered homepage unless it is rebuilt with clearer evidence, lighter UI, and approved claim scope.

Hero behavior:
- The first homepage viewport should feel full-screen on desktop and mobile.
- Desktop video is acceptable when it does not slow first meaningfully visible content; mobile should use a poster or optimized mobile-specific media until a smaller video variant is approved.
- The homepage hero and global header may use the edge-aligned container instead of the standard page container when the first viewport needs a full-bleed editorial composition.
- Homepage hero title motion should be restrained, sequential, and reduced-motion aware. Letter-by-letter left-to-right reveals are acceptable when they clarify hierarchy rather than delaying access to content.
- The approved first-viewport verb stack is all-caps, with a deliberate second-line offset, lighter Urblo punctuation, and enough bottom proximity to feel anchored without clipping on mobile.

### Stone Library
Stone Library is an inspection and specification aid, not a product marketing grid.

Priorities:
- texture visibility
- finish comparison
- compact filters
- fast scan of type, tone, origin, status, and price tier
- specs close to imagery
- direct path to sample/contact behavior

Interaction rules:
- Click or explicit controls should change material state. Hover may preview only when it does not create ambiguity.
- Active finish state must remain stable across left and right controls.
- Secondary frames are supporting inspection media for the selected finish, not new finish states.
- Secondary frame thumbnails should appear only when approved source images exist; do not show placeholder secondary frames.
- Finish imagery must disclose whether the active image is finish-specific, a reference/default view, or pending. Never let fallback imagery read as a confirmed finish photo.
- Image overlay labels on Stone Library media, including list-card status badges and detail-stage provenance labels, must stay readable across light, dark, and patterned stone: use dark translucent backplates with white text, and reserve Urblo lime for small confirmed/interactive signals rather than broad label fills.
- Availability/status pills outside imagery should stay light: use a thin Urblo lime outline/wash and medium-weight type for confirmed available states, muted white/neutral pills for upcoming or unavailable states, and avoid heavy black status blocks or full lime badge fills in selectors or data tables.
- Mobile layout must prioritize readable finish names and image inspection over decorative layout.
- Placeholder usage must be visible enough to be honest but quiet enough not to dominate the tool.

### Projects
Projects are proof assets.

Each project should answer:
- Why was stone selected?
- What design or delivery problem did Urblo solve?
- What stone, finish, quantity, year, designer, and contractor were involved?
- What result can another project team trust?

Avoid purely visual gallery behavior without project facts.

### Capabilities
Capabilities should read as an operational capability map, not a generic services page.

Priorities:
- show how Urblo supports design translation, specification, sourcing, fabrication, delivery, and handover
- connect visual ambition to concrete workflow evidence
- keep the page short enough to scan before a project conversation
- make the content easy to replace when client-approved capability copy arrives

Avoid:
- abstract service cards with no project workflow
- broad claims that imply guaranteed cost, timing, carbon, or compliance outcomes without conditions
- oversized hero drama that delays the actual capability framework

Project Material Map pattern:
- Use real project photography as an inspection surface, not a decorative gimmick.
- Hotspots should identify material and finish placement first; avoid broad conceptual markers unless they are tied to a material/application fact.
- Desktop may use hover as preview, but click/focus must also work.
- Mobile must use tap/focus behavior and show the selected material inspector close to the image.
- Keep marker count low enough for the image to remain inspectable.
- Hotspot inspectors should name stone, finish, application, project note, and next action when useful.
- Separate confirmed project facts from MVP-inferred narrative until the designer/project team confirms the content.

Project typography:
- Project archive/detail title typography is the source reference for global page-level H1s: `Avenir LT Std`, light `300`, normal letter spacing, no forced uppercase.
- Project section headings use `Avenir LT Std` medium/semibold weight and uppercase sparingly for scanability; avoid `Space Grotesk` for project-page titles unless a future brand decision explicitly changes the project system.

### Products
Product detail pages should behave like configuration and enquiry surfaces, not static render galleries.

Priorities:
- make the selected model and material choices visible outside the buttons
- keep the product render large enough to inspect
- use CTA copy that starts a real project conversation
- show pending imagery honestly without making missing assets dominate the page
- separate product geometry renders from selected material swatches unless the render is truly composited from those selections
- frame specs as project-confirmed discussion cues unless final engineering data has been approved

### Our Story
Our Story should feel human, disciplined, and credible. It should support trust in Natalie, Cameron, SAI Stone, and the Urblo model without becoming a founder vanity page.

Use portrait/team content only when it strengthens credibility. Keep team UI stable and proportionate when the team count changes.

### Contact
Contact should be direct and low-friction.

The main Contact form now targets the Pages Function form endpoints rather than a local email draft. Keep the experience operational and honest: success/error states should be visible inline, direct email and phone should remain available, and production copy must not imply delivery of a sample until the submission is stored successfully.

Until live Supabase write verification is complete in the Cloudflare environment, keep fallback direct contact channels visible and document the environment gap in Harness docs.

The page should help users choose a next step:
- request samples
- discuss a custom detail
- talk through an early-stage project
- explore Stone Library first

### Articles and Q&A
Trust-building pages should not feel like generic help-center content.

They should:
- answer real project uncertainty
- group content by audience or decision type
- put short useful answers first
- expand into proof and constraints
- avoid turning one-off email facts into universal company claims

### Admin
The future `/admin` experience is an operational tool, not a public brand page.

Priorities:
- dense but readable content lists
- clear draft, review, published, archived, and TBC status treatment
- content health warnings before visual decoration
- fast table/detail editing for repeated maintenance work
- obvious read-only, unauthorized, loading, and unsaved-change states

Avoid:
- marketing-style hero sections
- decorative cards inside cards
- ambiguous save/publish controls
- free-form page-builder UI where structured fields are safer
- implying backend submission or authentication works before Supabase is implemented

Current source state:
- `/admin` now uses a black/white operational shell with compact navigation and status-led content.
- Admin routes intentionally sit outside the public site chrome and suppress the public WelcomePopup.
- Without browser-safe Supabase configuration, admin routes show a configuration-required state instead of placeholder dashboards.
- `/admin/settings` is the first source CRUD surface and should remain dense, form-led, and status-led. Its admin team controls should feel like access operations, not a decorative people directory: compact rows, clear role/status pills, explicit owner protection, and no destructive controls.
- `/admin/media` is the first media library source surface and should remain operational: compact record list, upload panel, metadata editor, explicit draft/published/archived state, audit-gated media manifest export, and clear publication guardrails.
- `/admin/stone-library` is the first content CRUD source surface and should remain operational: compact stone list, status-led group and variant forms, finish capability matrix, explicit TBC states, and publication guardrails.
- `/admin/projects` is now a protected source CRUD surface and should remain proof-operational: compact project list, claim-review state, structured facts/material schedules, material-map and hotspot controls, and clear publication guardrails.
- `/admin/products` is now a protected source CRUD surface and should remain configuration-operational: compact product list, model/spec/default-material controls, Stone Library references, and clear publication guardrails.
- `/admin/articles` is now a protected structured editorial CRUD surface and should remain operational: compact article list, metadata form, structured block rows, reference linking, legacy-source provenance, and clear publication guardrails.
- `/admin/leads` is now a protected lead workflow source surface and should remain privacy-conscious: compact inbox, clear contact detail, sample item rows, status/assignment/notes workflow, notification state, audit-gated owner/admin CSV export, and no decorative CRM clutter.
- `/admin/audit` is now a protected read-only review surface and should remain restrained: compact event list, clear actor/entity metadata, JSON inspection, owner/admin restriction, and no destructive controls.

## Component Rules

### Buttons and CTAs
- Primary CTAs should be plain, decisive, and easy to locate.
- Use icons where they clarify the action.
- Do not overuse boxed text buttons for simple tool controls when icons or segmented controls are clearer.
- Disabled or placeholder CTAs must be visibly intentional.

### Filters and Controls
- Filters should be compact, predictable, and close to the content they affect.
- Use segmented controls, select menus, toggles, checkboxes, sliders, and steppers according to the actual input type.
- Avoid decorative controls that look interactive but do not change state.

### Route and System States
- Loading, not-found, and load-error states should feel like calm operational surfaces, not broken template remnants.
- Use the shared `RouteState` pattern for public route-level states unless a page needs a more specific recovery workflow.
- State copy should be short, factual, and paired with useful next actions when the user is blocked.
- Unknown URLs must preserve Urblo navigation pathways without pretending the requested page exists.
- No-banner route states must clear the absolute header; do not let loading or 404 copy sit underneath navigation.

### Motion
- Motion should communicate state, focus, or transition.
- Avoid motion that delays inspection of material or reading of specs.
- Scroll/centering behavior must not fight user intent.
- Page transitions should stay restrained: short opacity/vertical movement, no decorative wipes, and reduced-motion support.
- Numeric count-up motion belongs only on structured proof metrics. Do not animate dates, dimensions, prices, product specifications, body copy numbers, native select option labels, filter counts, or material-card scan counts.

### Mobile
Mobile is not a squeezed desktop page.

Rules:
- No horizontal overflow.
- Toolbars and filters must wrap cleanly.
- Long labels must not overflow buttons or cards.
- Image inspection must remain possible without huge empty vertical gaps.
- Text contrast must remain strong on all backgrounds.

## Copy and Claim Rules in UI

Use confident headlines, but grounded bodies.

Good pattern:
- headline: outcome or belief
- body: method and constraint
- proof: project, metric, photo, or process
- CTA: low-friction next action

Avoid:
- absolute guarantees without verified scope
- luxury-only language
- vague sustainability badges
- "premium" as a substitute for proof
- over-promising factory control when source ownership is limited

When unsure, write the condition instead of smoothing it away.

## Design QA Checklist
Before shipping a user-facing page or component, check:
- Does it make a project decision easier?
- Does it pair beauty with buildability?
- Does imagery reveal context, use, or texture?
- Are typography scale and spacing appropriate for the page type?
- Is Stone Library/tool UI compact enough for repeated use?
- Are claims condition-safe and aligned with brand baseline?
- Are CTAs real, route-safe, and low-friction?
- Does mobile avoid overflow, text collision, and unusable controls?
- Is the page recognizably Urblo rather than a generic template?

## Open Design Debt
- Final parity for Home, Our Story, Articles, and Contact still depends on approved Figma/WordPress references.
- Stone Library finish image coverage remains active data work; secondary frame behavior is implemented for approved Juparana and Zen Grey source frames.
- Future sample ordering needs a real form/backend decision before UI can imply submission.
- The website still needs a clearer long-term content system for Project Spotlight, Material Mastery, Behind the Scenes, and Concrete vs Stone themes.
