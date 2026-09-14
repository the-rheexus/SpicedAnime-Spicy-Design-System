---
title: "PPTX Generation and Layout Engine Spec"
version: "2.6"
status: "Pending Owner Verification"
last_verified: "2026-09-13"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - Production Batch Engine
  - PPTX Generation Engine
  - Cloud File Storage
database_dependencies:
  - production_components
  - production_batches
  - batch_items
  - print_templates
  - generated_files
core_lifecycle_states:
  - Open
  - Locked for Review
---

# PPTX Generation and Layout Engine Spec

Defines how the PPTX file is generated from a locked batch. Covers slide structure, per-product layout grids, page overflow rules, image pairing for front/back products, metadata text box placement, and file output naming. Translates the per-image specs in `Product_Image_Transformation_Guidelines.md` into slide-level generation behavior.

## Slide Specifications

| Setting | Value |
| :--- | :--- |
| Slide width | 8.5 inches |
| Slide height | 11 inches |
| Orientation | Portrait |
| Margins | PowerPoint default (left/right 1", top/bottom 1") |

## Per-Product Layout Grids

Per-product layout grids are derived from per-page capacity in `Product_Image_Transformation_Guidelines.md`.

| Product | Per Page | Grid (rows x columns) | Notes |
| :--- | :---: | :--- | :--- |
| Grinder | 12 | 4 x 3 | Grid locked by Decision #120. |
| Jar | 12 | 4 x 3 | Grid locked by Decision #120. |
| Tray | 2 | Diagonal overlap | Two 4.05" W × 5.7" H trays placed in a diagonal composition: the first tray begins near the upper-left of the usable area; the second begins farther right and lower, intentionally overlapping the first. Positions are derived from the owner-supplied P136.4 reference deck and are encoded as fixed EMU coordinates in the layout engine. A partially filled final slide with a single tray is expected and correct. Supersedes the prior "3 stacked vertically" description; approved by owner via the P136.4 reference deck. |
| Lighter | 10 lighters (20 placements) | 4 rows x 5 columns, in two vertical blocks of 5 lighters each | Each block is a row of 5 fronts (LITF) directly above a row of 5 backs (LITB) for the same 5 designs, front and back stacked vertically per design rather than side by side. Per Decision #48. |
| Ashtray | 6 | 3 x 2 | At 3.4" diameter, 3 rows of 2 fits. |
| Tin | 8 | 4 x 2 | TBD requires owner approval if a different grid is preferred. |
| Box | 2 | 2 x 1 | At 4.3" H x 6.25" W, two stacked vertically. |
| Wallet | 4 wallets (8 placements) | 4 rows x 2 columns | Each row is one wallet, with front (WALF) and back (WALB) placed side by side in that row's two columns. Per Decision #56. |

## Page Overflow Rule

- If components in a batch exceed per-page capacity, generate additional slides of the same template until all components are placed.
- Components are placed in component ID order (oldest first) within a slide and across slides.
- **Multi-product batch groups (Decision #120).** When a batch group contains more than one product type — currently only `Grinder/Jar/Tray` (Grinder, Jar, and Tray components) — components are first grouped by product type into contiguous single-type slide runs, in the order Grinder, then Jar, then Tray. A slide never mixes product types. Each run uses that product's own grid from the Per-Product Layout Grids table above, and each slide carries the product-type metadata text box defined in the Metadata Text Boxes section. The oldest-first rule above orders components only within a single product type's run.
- **Lighter and Tin color grouping (Decision #121, superseding Decision #57).** Lighter and Tin components are grouped by their SKU color code (`WHT`, `SIL`, `GLD`) into contiguous single-color slide runs; a slide never mixes color codes, and `WHT` and `GLD` are grouped separately even though both use the `#FBE3D6` border. The oldest-first rule orders components only within a single color run, and a Lighter front/back pair is never split across color runs (both halves carry the order's color code). A partially filled final slide for a product type or color code is expected and correct.

## Front/Back Placement

- For each lighter component pair (LITF + LITB from the same order item), the layout engine places both copies of the source artwork file in the same column, one row apart (front directly above back), per Decision #48, applying the lighter transformation parameters to both. Path resolution is family-aware: `LIT`-family pairs source from `artwork/Flip Lighter/{DESIGN_CODE}.png`; `BOX`-family pairs (from BOXLIT and BOX4) source from `artwork/Stash Box/{DESIGN_CODE}/LIT.png` instead.
- For each wallet component pair (WALF + WALB from the same order item), the layout engine places both copies of the source artwork file side by side on the slide, applying the wallet transformation parameters to both.
- The pairing is preserved on the same slide. If a pair would split across slides due to overflow, the entire pair moves to the next slide.

## Image Preprocessing (Pillow)

Before an artwork image is placed on a slide, a Pillow (PIL) preprocessing step applies the structural transform parameters defined per-product in `Product_Image_Transformation_Guidelines.md` — crop, border, corner-rounding, flip, rotation, and any pixel-baked image enhancements (Decisions #131, #136):

- Circle crop, per product shape, for Grinder, Jar, and Ashtray. Rounded-rectangle corner masking for Lighter and Tin, with corner radius determined proportionally by the shape's own dimensions rather than a fixed value (Decision #53).
- Fit vs. crop-to-shape mode. Tin and Wallet images are scaled to fit fully within their shape without cropping (contain-fit mode, Decisions #50, #52). Lighter (`LITF`/`LITB`) images use cover crop (`_resize_cover_crop`), scaling and cropping to fill the rounded-rectangle container while preserving aspect ratio and avoiding letterboxing (Decision #136). Grinder, Jar, Ashtray, and Box images are cropped to completely fill their shape (Decision #54).
- Border color and weight application: all bordered products (Lighter, Tin, Wallet, Grinder, Jar, and Ashtray) use a 0.75pt solid line (Decision #62, superseding the earlier per-product weights in Decisions #49, #51, #55). Border color follows the conditional White/Gold (`#FBE3D6`) vs. Silver (`#E8E8E8`) rule for Lighter and Tin; Grinder and Ashtray borders are `#E8E8E8`, and Jar and Wallet borders are `#FBE3D6` (Decision #62). Border color is resolved independently per component from that component's own order SKU color code and is not fixed at batch assignment. Per Decision #121 (superseding Decision #57), Lighter and Tin components are grouped by SKU color code (`WHT`, `SIL`, `GLD`) into contiguous single-color slide runs during slide assembly, so a single slide never mixes color codes; `WHT` and `GLD` are grouped separately even though both use the `#FBE3D6` border. See the Page Overflow Rule.
- Adjustment processing split (Decisions #126, #131). Brightness and Contrast default to native PPTX/OOXML picture corrections (`<a:lum>`), but when manual override is enabled for that group (`brightness_manual_override` or `contrast_manual_override`), the native tag is omitted and the adjustment is baked into pixels via Pillow `ImageEnhance`. Saturation and Sharpness are always applied via Pillow `ImageEnhance` during this preprocessing step with no native OOXML path (Decision #131).
- Horizontal flip, where specified (Ashtray).
- 90-degree rotation for `TIN` components. After all standard Tin transform parameters are applied, the output buffer is rotated 90 degrees before placement on the slide. The source file is stored upright in Drive; the rotation is programmatic.
- Conditional 90-degree rotation for `LITF`/`LITB` (Lighter) components. Unlike Tin's unconditional rotation, this applies only when the source artwork image is landscape-oriented; portrait-oriented source images are left unrotated. Per Decision #45.
- GRD-from-ASHGRD reshape. When a `GRD` component's `family_code` is `ASH`, the source file is the Ashtray artwork (shared with the `ASH` placement in the same order). The GRD transformation parameters (2.45" circle crop, `#E8E8E8` border, and the Grinder color adjustments of -10% Brightness, +25% Contrast, 150% Saturation per Decision #62) are applied to produce the grinder print, not the Ashtray parameters.
- **Operator adjustment overrides (Decisions #125, #126, #131).** The four adjustment values — Brightness, Contrast, Saturation, and Sharpness — are resolved at generation time, not read statically from this document. The resolver (`resolve_component_adjustments` in `pptx/adjustments.py`) begins with the linked `PrintTemplate.adjustments` (the product-type default from `Product_Image_Transformation_Guidelines.md`) and then overlays any keys present in `ProductionBatch.adjustment_overrides` (or `EventPrintJob.adjustment_overrides` for Event Prints, Decision #136) for the component's code. A batch or job override for a key always beats the product-type default for that key, including after the default is later changed. For Brightness and Contrast, values are written onto the embedded picture as native PPTX/OOXML `<a:lum>` picture-correction properties unless the corresponding manual override switch (`brightness_manual_override`, `contrast_manual_override`) is active; when active, native corrections are suppressed and the values are baked in via Pillow. For Saturation and Sharpness, values are always baked in via Pillow (Decision #131). Non-editable template keys (`flip_horizontal`, border values, etc.) are not part of the editable set and are not affected by overrides. See `Technical_Architecture_and_API_Contract.md` (Image Adjustment API Contract section) for the full stored-unit scale, sparseness contract, and API details.

The preprocessing step runs once per source image per component placement, producing a transformed image buffer that is then placed into the slide at the dimensions defined in the Per-Product Layout Grids table above. When the same source file is shared across multiple component placements in the same batch (LITTIN, ASHGRD), the file may be cached by Drive file ID to avoid redundant fetches, but the preprocessed output must not be cached across different component types in the cache. `Pillow` must be added to the backend dependencies as a new library for this step. This section defines the intended preprocessing behavior.

## Non-Batch Generation (Preview and Event Prints)

Two operator-triggered flows reuse this same layout and preprocessing engine without going through the normal batch lifecycle:

- **Batch preview (Decision #72).** From an `Open` batch, the operator can generate a full production-quality PPTX for review without locking the batch. This calls the same generation path as the normal Generate PPTX flow, but skips every batch/component mutation: the batch does not transition to `Locked for Review`, no new `Open` batch is created, and no component status changes. The output file is not recorded in `generated_files` (there is no `production_batch_id` transition to attach it to); it is returned as a direct Drive link in the API response only.
- **Event Prints (Decision #73).** From the Event Prints screen, the operator selects producing products and quantities directly, without a Shopify order or a batch. This constructs an in-memory component list (bypassing SKU parsing and `production_components` entirely, since there is no order) and passes it through the same layout and preprocessing engine used for batch generation. No `orders`, `production_components`, `production_batches`, or `generated_files` rows are created. The output file is not recorded in `generated_files`; it is returned as a direct Drive link in the API response only, per the naming and path convention in `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`.

Both flows are read/generate-only against source artwork and produce output files distinctly named from normal batch output (see `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`) so neither can be mistaken for a locked-batch print file.

## Metadata Text Boxes

| Product | Text Box Content | Placement |
| :--- | :--- | :--- |
| Lighter | "Color: <COLOR>" (where COLOR is WHT, SIL, or GLD spelled out as White, Silver, or Gold) | Bottom of slide |
| Tin | "Color: <COLOR>" (same color codes as lighter) | Bottom of slide |
| Grinder | "Grinder" (the slide's single product type, per Decision #120) | Bottom of slide |
| Jar | "Jar" (the slide's single product type, per Decision #120) | Bottom of slide |
| Tray | "Tray" (the slide's single product type, per Decision #120) | Bottom of slide |

## Generated File Output

| Property | Value |
| :--- | :--- |
| File naming pattern | `{BATCH_GROUP}-BATCH-{YYYYMMDD}-{###}.pptx` |
| Example | `Lighter-BATCH-20260614-001.pptx` |
| Storage location | Google Drive, in batches folder per `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` |
| MIME type | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| Editability | The generated PPTX is editable by default. Crop, border, corner-rounding, and flip are baked into the image via the Pillow preprocessing step and are not later editable in PowerPoint. Brightness and Contrast are applied as native PPTX/OOXML `<a:lum>` picture-correction properties on the embedded picture by default (Decision #126), remaining visible and further adjustable in PowerPoint's own Format Picture pane unless the manual override switch is enabled. When manual override is enabled for Brightness/Contrast, or for Saturation and Sharpness (Decision #131), values are baked into the image pixels via Pillow and cannot be fine-tuned via PowerPoint's native picture properties without manual adjustment in PowerPoint. Operator edits after generation are optional, not required. |

## Generation Workflow

- Trigger: operator clicks Generate PPTX on a batch in `Open` status.
- The batch transitions to `Locked for Review` synchronously.
- A new `Open` batch is created for the same production group synchronously.
- A Celery task is dispatched to generate the PPTX file.
- The task uses `python-pptx` to construct the file and uploads to Google Drive via `google-api-python-client`.
- On success, the batch's `generated_file_url` field is updated with the Drive shareable URL.
- On failure, the batch transitions back to `Open` and a `FAILED_PPTX_GENERATION` error is logged. The new `Open` batch created for the group remains in place; the original batch returns to `Open` status to allow retry.

## PDF Export

- Deferred to Phase 2.
- Not implemented in MVP.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Product_Image_Transformation_Guidelines.md` | Source of per-image transformation parameters consumed by this engine. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the Google Drive folder structure where generated PPTX files are stored. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines the batch state transitions triggered by Generate PPTX. |
| `Technical_Architecture_and_API_Contract.md` | Defines the Celery task infrastructure. |
