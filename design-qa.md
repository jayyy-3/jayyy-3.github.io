# QR material page design QA

final result: passed

## Target and evidence

Jay selected the September 9 option 1 mobile mock. Compared that supplied generated reference and the rendered two-image page in the same review input. The reference is approximately 791 × 1987 pixels, corresponding to a 390px-wide mobile page. The in-app browser rendered at 390px CSS width and DPR 1, with 980px viewport and a 1060px extended capture to include both actions. The page naturally scrolls. Captures use the actual existing Zen Grey/Honed QR seat image and exact static Honed surface; temporary read-only local fixture supplies the QR lookup. This is visual evidence, not production data-save evidence.

## Findings and iteration

- P2, initial layout: header and captions added excess vertical space, and the raw-block unit wrapped onto its own line. Reduced header gap, caption leading, fact padding and raw-block type size. The revised capture shows the complete block dimensions on one line, distinct images and compact facts with two reachable actions.
- No remaining P0/P1/P2 design issues in the selected route/state.
- Expected adaptation: retain the supplied brand-logo asset and real uncropped product image rather than the generated mock's redrawn logo and enlarged product crop. The surface is the actual fixed-finish photograph. Both image controls and actions retain at least 44px targets, making the page slightly taller than the mock.

## Required fidelity surfaces

- Typography: existing Urblo sans family, light 34px stone title, quieter finish/captions and readable factual labels. Raw block does not truncate at 390px.
- Spacing/layout: 20px mobile gutters, 3:2 application panel, 21:10 surface panel, separate captions, two-column fact grid, stacked full-width actions. No horizontal overflow at 390px.
- Colors/tokens: white page, black typography/actions, supplied green identity and small green availability/price indicators; subtle rules and neutral image ground.
- Image quality: original 2560px seat rendering and exact Honed surface; independent enlargement preserves full image proportions. No placeholder/reconstructed product or texture.
- Copy/content: product application and actual material image are explicitly distinguished. Project-sourcing and indicative-tier qualifiers remain. Library link retains stone, variant and finish; enquiry includes the canonical QR URL.

## Interaction checks

In-app browser verified both image dialogs, zoom pressed state, Escape close and focus restoration. Stone Library action preserves `variant=zen-grey&finish=honed`; catalog metadata returns to `index,follow`. Isolated staff-selector check verified default state, Tuscany selection, Cross Cut/Honed surface preview, save → Saved selection, and cleared dirty state. Backend role, stale-save and persisted public readback checks are separately covered in the in-memory Function verifier.

## Release boundary

Visual QA passes. The Preview binding blocker was resolved with approved encrypted configuration. Migration, real same-material UI save/reload/public readback (audit 358), clean Node 20 container and CI gates, full Preview smoke and authenticated routes passed. Production PR #38 / 018341a / 33d09e60 passes immutable/apex/www smoke and dedicated QR checks; production browser confirms both actual images, facts/actions and no overflow. Production auth passed all 10 routes on a fresh retry after an initial Projects load error. Staff must confirm defaults; the reference does not establish factual matches for other QR product images.
