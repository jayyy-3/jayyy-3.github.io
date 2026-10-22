# Urblo project package (version 1)

A project package is how a finished project story moves from Claude Design into the Urblo website admin. It is one file, `project.json`, or a `.zip` that holds `project.json` and an `images/` folder. The admin turns it into a **Draft** project: every block in place, images in the private media library, stones linked to the Stone Library. Nothing is published until an editor checks the draft and presses **Publish**.

The package carries content, not layout. Urblo's page design decides fonts, spacing and colours; the package only says which blocks appear, in which order, with which words, numbers, images and stones.

- Machine-readable schema: [`project-package.schema.json`](project-package.schema.json) (JSON Schema 2020-12).
- Full example: [`examples/greenline/project.json`](examples/greenline/project.json).
- Prompt for Claude Design: [`CLAUDE_DESIGN_PROMPT.md`](CLAUDE_DESIGN_PROMPT.md).

## How to import

1. In Claude Design, use the prompt in `CLAUDE_DESIGN_PROMPT.md` and export the zip (or the JSON).
2. Optional self-check on a computer with the website code: `npm run agent:project-package -- path/to/package.zip`.
3. In the admin, open **Projects** and press **Import package** (Website owners, CMS managers and Editors; Viewers do not see it).
4. **Choose file**: drop the `.zip` or `.json`, or paste the package text.
5. **Check the package**: the report shows the title, page address, every block, how many images were found and how many to add later, which stones were found and which need choosing. Errors must be fixed in Claude Design and exported again; warnings are things to finish in the editor.
6. Press **Create draft**. Images upload one by one; if one fails, choose **Retry** or **Skip this image** (it becomes an image to add later). The draft is then saved and opens in the editor.
7. In the editor, work through the publish notes: add missing images, choose any stone that was not found, mark materials on an image if needed, then **Save**, **Open preview** and **Publish**.

Importing never changes an existing project. If the page address is already used, the import adds `-2`, `-3`… to it.

## The file

```json
{
  "format": "urblo-project-package",
  "version": 1,
  "project": {
    "title": "The Greenline Project, Birrarung Marr Site 1",
    "slug": "greenline-birrarung-marr",
    "location": "Melbourne, VIC",
    "projectDateLabel": "2026",
    "completedOn": "2026-03-01",
    "summary": "Tiered stone seating along the river edge.",
    "lead": "Congratulations to City of Melbourne and Tract on a landmark civic landscape.",
    "client": "City of Melbourne",
    "landscapeArchitect": "Tract",
    "contractor": "Symal",
    "address": "",
    "quantityLabel": "",
    "facts": [
      { "label": "Award", "value": "2026 AILA VIC Landscape Architecture Award, Civic Landscape" }
    ],
    "materials": [
      { "stone": "blueocean", "finish": "sawn", "application": "Tiered seating steps", "note": "" }
    ],
    "hero": { "file": "images/hero.jpg", "alt": "Tiered bluestone seating steps on the Yarra riverbank" },
    "cover": { "file": "images/hero.jpg", "alt": "Tiered bluestone seating steps on the Yarra riverbank" }
  },
  "blocks": [
    {
      "type": "heading",
      "eyebrow": "Signature project",
      "title": "From design intent to fabrication reality",
      "intro": "Here is how the Greenline stone went from drawing to riverfront."
    },
    {
      "type": "stats",
      "items": [
        { "value": "1398 + 1000", "unit": "mm", "label": "Staggered module lengths across a 3800 mm stair width" },
        { "value": "2", "unit": "mm", "label": "Joints, set out and dimensioned on the drawing" }
      ]
    },
    {
      "type": "steps",
      "items": [
        {
          "title": "Shop drawing",
          "body": "Every stair began as a coordinated shop drawing, with module lengths, joints and set-out agreed before any stone was cut.",
          "image": { "file": "images/step-1.jpg", "alt": "Shop drawing of the stair setting-out" }
        }
      ]
    },
    {
      "type": "image",
      "image": { "file": "images/as-built.jpg", "alt": "As built: staggered joints and a crisp arris" },
      "caption": "As built: staggered joints, a crisp arris, and Alpine White granite strips set into Steel Blue.",
      "presentation": "photo"
    },
    {
      "type": "stone_cards",
      "title": "The stone",
      "items": [
        { "stone": "blueocean", "finish": "sawn" },
        { "stone": "alpine-white", "finish": "flamed" }
      ]
    },
    {
      "type": "spec_table",
      "rows": [
        { "label": "Application", "value": "Tiered seating steps and transition elements" },
        { "label": "Slip rating", "value": "P5" }
      ]
    },
    {
      "type": "cta",
      "title": "Talk to us early",
      "body": "The best outcomes come when fabrication is part of the conversation during design development.",
      "primary": { "label": "Discuss a project", "href": "/contact" }
    }
  ]
}
```

### Top level

| Field | Required | Meaning |
| --- | --- | --- |
| `format` | yes | Exactly `"urblo-project-package"`. |
| `version` | yes | Exactly `1`. |
| `project` | yes | The project header (below). |
| `blocks` | yes | The page body, in order. May be empty. Up to 100 blocks. |

Any other field, anywhere in the file, is an error. The importer names its location, for example `blocks[2].items[0].image.alt`.

### `project`

| Field | Required | Limit | Meaning |
| --- | --- | --- | --- |
| `title` | yes | 200 | Project name as shown on the page. |
| `slug` | no | 200 | Page address after `/projects/`: lowercase letters, numbers and single hyphens. Made from the title when left out. |
| `location` | no | 200 | Suburb and state, e.g. `Melbourne, VIC`. |
| `projectDateLabel` | no | 200 | Year or period shown on the page, e.g. `2026`. |
| `completedOn` | no | date | Completion date as `YYYY-MM-DD`. |
| `summary` | no* | 400 | One sentence for project cards. |
| `lead` | no* | 5000 | Opening paragraph on the page. |
| `client` | no | 200 | Client. |
| `landscapeArchitect` | no | 200 | Designer or landscape architect. |
| `contractor` | no | 200 | Builder or contractor. |
| `address` | no | 200 | Street address, if it may be public. |
| `quantityLabel` | no | 200 | Quantity, e.g. `850 m²`. |
| `facts` | no | 100 | Extra facts: `{ "label", "value" }` (label 200, value 400). |
| `materials` | no | 100 | Material schedule: `{ "stone", "finish", "application", "note" }`. `stone`, `finish` and `application` (200) are required, `note` (400) optional. |
| `hero` | no | | Main image `{ "file", "alt" }`. |
| `cover` | no | | Card image `{ "file", "alt" }`; usually the same file as `hero`. |

\* Publishing needs a summary or a lead, and a main image.

Not in the package on purpose: carbon details, Live/Draft status, review states and anything about material points. Editors set those in the admin.

### Images: `{ "file", "alt" }`

- `alt` is required for every image: describe what is visible ("Tiered bluestone seating steps on the Yarra riverbank"), not the file name. Up to 400 characters.
- `file` is the path inside the zip, always `images/<name>.jpg`, `.jpeg`, `.png` or `.webp`. No sub-folders.
- Leave `file` out (or export JSON only) when the photo is not ready. The block is imported with its description and the image is listed as "to add later".
- A file used in several places is uploaded once; each place keeps its own `alt`.
- Each image up to 10 MB, long edge at least 1600 px. Up to 50 different images and 100 MB per zip.
- The website publishes up to 30 new images at a time: a package with more imports fine, but publish with up to 30 images first, then add the rest and publish again.
- Original photos are kept at full quality; the website prepares screen sizes automatically.
- Images are never cropped on the page. Landscape images run full width; square and portrait images sit in a narrower centred column, and two square or portrait `image` blocks in a row are shown side by side. Export images at their real proportions; do not pad or crop them to 16:9.
- For a shop drawing, plan, section or other light-background document in an `image` block, add `"presentation": "drawing"`: it is shown on a light framed surface instead of as a photo.

### Stones: `{ "stone", "finish" }`

- `stone` is the Stone Library address: the `<slug>` in `https://urblo.com.au/stone-library/<slug>`, e.g. `blueocean` or `alpine-white`.
- `finish` is a finish key from the table below. The importer also accepts the finish name ("Bush Hammered") and ignores case, spaces and hyphens.
- Only stones that are Live in the Stone Library are linked. Anything else is imported as "stone to choose" and stops Publish until an editor picks the stone.
- For a stone with several variants (for example Golden Crust Light/Dark or Tuscany Vein Cut/Cross Cut) the first variant that offers the finish is chosen; the editor can change it.

Finish keys (from the finish definitions, 2026-10-15):

| Key | Name |
| --- | --- |
| `flamed` | Flamed |
| `sawn` | Sawn |
| `honed` | Honed |
| `polished` | Polished |
| `bush_hammered` | Bush Hammered |
| `combed` | Combed |
| `rippling` | Rippling |
| `rippling__fine` | Rippling (Fine) |
| `rippling__rough` | Rippling (Rough) |
| `rock_face` | Rock Face |
| `sparrow_peck` | Sparrow Peck |
| `sandblasted` | Sandblasted |

Live Stone Library on 2026-10-15 (18 published stones; source: [`stone-catalogue-2026-10-15.json`](stone-catalogue-2026-10-15.json)). For any stone added after this date, copy the slug from the stone's page on the live Stone Library. Note that some slugs differ from the stone's name (Steel Blue is `blueocean`, Mica Grey is `harcourt`, Verdant Grey is `v-erdant-grey`).

| Slug | Stone | Finishes offered |
| --- | --- | --- |
| `alpine-white` | Alpine White | `flamed`, `honed`, `polished`, `sawn` |
| `angola-black` | Angola Black | `bush_hammered`, `flamed`, `honed`, `polished`, `sawn` |
| `ausdream` | Ausdream | `honed` |
| `ausred` | Ausred | `honed` |
| `golden-crust` | Golden Crust | `flamed`, `honed`, `polished`, `sawn` |
| `honey-comb` | Honey Comb | `honed`, `sawn` |
| `ivory-sand` | Ivory Sand | `bush_hammered`, `honed`, `sparrow_peck` |
| `juparana` | Juparana | `flamed`, `honed`, `polished`, `sawn` |
| `harcourt` | Mica Grey | `bush_hammered`, `combed`, `flamed`, `honed`, `polished`, `rippling`, `rock_face`, `sandblasted`, `sawn`, `sparrow_peck` |
| `minos-grey` | Minos Grey | `honed` |
| `new-grey` | New Grey | `flamed`, `honed`, `polished`, `sawn` |
| `blueocean` | Steel Blue | `bush_hammered`, `combed`, `honed`, `rippling__fine`, `rippling__rough`, `rock_face`, `sawn` |
| `tan-brown` | Tan Brown | `flamed`, `honed`, `polished`, `sawn` |
| `tanier-pink` | Tanier Pink | `honed` |
| `tuscany` | Tuscany | `honed` |
| `v-erdant-grey` | Verdant Grey | `flamed`, `honed` |
| `viscount` | Viscount | `flamed`, `honed` |
| `zen-grey` | Zen Grey | `flamed`, `honed`, `polished`, `sawn` |

## Blocks

Every block is an object with `"type"` plus the fields below. Text limits: titles 200 characters, short text 400, body text 5000. "Required" fields must be filled in; empty text counts as missing.

| `type` | Use it for | Fields |
| --- | --- | --- |
| `heading` | Start a section of the story. | `title` (required, 200), `eyebrow` (small label, 200), `intro` (400) |
| `text` | Paragraphs of story. | `body` (required, 5000, restricted Markdown) |
| `quote` | A short quote from a client, designer or builder, with permission. | `quote` (required, 400), `attribution` (200), `role` (200) |
| `callout` | One note that should not be missed. | `body` (required, 400), `title` (200), `tone` (`neutral` default, or `lime`) |
| `stats` | One to four key numbers. | `items` (1–4): `value` (required, 200), `unit` (200), `label` (required, 400); `caption` (400) |
| `steps` | A numbered process, such as design to fabrication. | `items` (1–8): `title` (required, 200), `body` (required, 5000), `image` (optional image); `intro` (400) |
| `spec_table` | Label and value rows: finish, thickness, slip rating, supply. | `rows` (1–12): `label` (required, 200), `value` (required, 400); `title` (200) |
| `comparison_table` | Two to four options compared row by row. | `columns` (2–4 names, 200 each), `rows` (1–20): `label` (required, 200), `cells` (one per column, 400 each); `title` (200) |
| `stone_cards` | The stones used, with their Stone Library photo. | `items` (1–6): `stone` (required), `finish`, `note` (400); `title` (200) |
| `image` | One photo, drawing or document page. | `image` (required image), `caption` (400), `label` (200), `title` (200), `presentation` (`photo` default, or `drawing` for drawings and light-background documents) |
| `gallery` | Two to twelve photos in an even grid. | `items` (2–12): `image` (required image), `caption` (400) |
| `video` | A YouTube video. At most one per project. | `youtubeUrl` (required: https YouTube link or video ID), `title` (200), `label` (200), `caption` (400) |
| `cta` | A closing prompt with one or two buttons. | `title` (required, 200), `body` (400), `primary` (required), `secondary`: each `{ "label", "href" }`, where `href` is a site path such as `/contact` or an `https://` address |

`hotspot_image` (image with material points) cannot be imported. Import the photo as an `image` block; the editor presses **Mark materials on this image** and places the points.

### Restricted Markdown (`text.body`)

- Paragraphs are separated by a blank line.
- `**bold**`, `[link text](/stone-library/blueocean)` or `[link text](https://example.com)`.
- Lists: lines starting with `- `.
- Nothing else: no headings (`#`), numbered lists, tables, images or HTML. HTML is shown as plain text. Use a `heading` block for a new section.

## Checks the importer applies

Errors (the import cannot continue): wrong `format`/`version`; invalid JSON; a field that is not in this format; an unknown block type or `hotspot_image`; a missing required field; text over its limit; too few or too many items; an image without `alt`, or whose `alt` is just the file name; an image `file` outside `images/` or not JPG/PNG/WebP; a malformed `slug`, `stone` or `completedOn`; an unsafe button link or YouTube link; more than one video; more than 100 blocks, facts or materials or 50 different images. In a zip: any file other than `project.json` and `images/*`, paths that try to leave the package, files that are not real images, images over 10 MB, a zip over 100 MB.

Warnings (the draft is created, the editor finishes it): images to add later, images in the zip that no block uses, stones or finishes not found in the Stone Library, no summary or lead, no main image, HTML or headings inside text.

Every import is recorded in Change history (`project.import`, with the numbers of blocks, uploaded and pending images and unresolved stones).
