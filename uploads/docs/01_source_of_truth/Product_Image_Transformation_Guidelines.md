---
title: "Product Image Transformation Guidelines"
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
database_dependencies:
  - print_templates
---

# Product Image Transformation Guidelines

## General Print Specifications

- Output Format: PPTX (PowerPoint)
- Page Layout: 8.5" x 11" paper, Portrait orientation
- Margins: Standard PowerPoint default margins

Required YAML header correction:

```yaml
database_dependencies:
  - print_templates
primary_systems:
  - Production Batch Engine
  - PPTX Generation Engine
```

## Transform Application Behavior

The shape, dimension, and border parameters defined in this document are applied automatically by the PPTX generation pipeline before each image is placed on a slide. A Pillow (PIL) preprocessing step performs the crop, border, corner-rounding, and flip operations on the source artwork image. Per Decision #136, Lighter artwork uses cover crop (`_resize_cover_crop`) to fill the container shape while preserving aspect ratio, eliminating letterboxing.

**Adjustment Application Mechanism (Decisions #125, #126, #131).**
- **Brightness and Contrast:** Applied as native PPTX/OOXML picture corrections (`<a:lum>`) by default per Decision #126. Each setting possesses an on/off manual-override switch in `AdjustmentsPanel` per component group (Decision #131). Switch off: the native `<a:lum>` correction applies automatically and remains live-adjustable in PowerPoint. Switch on: manual override is active, native `<a:lum>` is suppressed for that setting, and the adjustment is baked into the image pixels via Pillow `ImageEnhance`; a blank value while the switch is on bakes a neutral (no-op) adjustment rather than falling through to automatic.
- **Saturation and Sharpness:** Per Decision #131 (amending Decision #126), Saturation and Sharpness drop the native PPTX mandate and remain permanently Pillow-baked only, because PowerPoint's only native mechanism (`a14:imgLayer`) requires manual slider interaction per picture to render. Blank means no adjustment is applied; any non-empty value is baked into the image pixels during Pillow preprocessing. An interface note directs the operator to PowerPoint's own Format Picture pane if live fine-tuning is preferred.

**Operator-editable adjustments (Decision #125).** The four adjustment parameters — Brightness, Contrast, Saturation, and Sharpness — are operator-editable per batch and per product type from the Batch Detail screen. The values in this document's Product Transformation Parameters table are the product-type defaults. An operator may override them for a specific batch (batch override) or save a new value as the default for all future batches (product-type default update). A batch override always takes precedence over the product-type default, including after the default is later changed.

Editable ranges (stored-unit integers): Brightness −100 to +100; Contrast −100 to +100; Saturation 0 to 400; Sharpness −100 to +100. A value of 0 is the neutral point for Brightness, Contrast, and Sharpness (no change); a value of 100 is the neutral point for Saturation (no change).

The remaining parameters in this document — shape, dimensions, border color and weight, crop mode, rotation, and flip — are not operator-editable and cannot be changed through the adjustment controls.

## Product Transformation Parameters

Per-product specs (all approved):

| # | Product | Shape | Dimensions | Border | Border Weight | Adjustments | Per Page | Images per SKU |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| 1 | Grinder | Circle crop | 2.45" diameter | `#E8E8E8` | 0.75pt solid | -10% Brightness, +25% Contrast, 150% Saturation | 12 | 1 |
| 2 | Jar | Circle crop | 2.65" diameter | `#FBE3D6` | 0.75pt solid | 55% Sharpness | 12 | 1 |
| 3 | Tray | (no crop) | 5.7" H x 4.05" W | None | N/A | None | 2 (intentionally overlapping diagonal composition per P136.4 reference deck) | 1 |
| 4 | Lighter | Cover crop to rectangle with rounded corners (radius proportional to shape size) (Decision #136) | 2.22" H x 1.42" W | White/Gold: `#FBE3D6`; Silver: `#E8E8E8` | 0.75pt solid | -15% Brightness, +25% Contrast, 200% Saturation, Conditional 90° Rotation (applied programmatically during PPTX generation if the source image is landscape-oriented; portrait-oriented source images are left unrotated) | 10 lighters (20 image placements) | 2 (front and back, same source file) |
| 5 | Ashtray | Circle crop | 3.4" diameter | `#E8E8E8` | 0.75pt solid | -25% Brightness, +35% Contrast, 300% Saturation, Flip Horizontal | 6 | 1 |
| 6 | Tin | Rectangle with rounded corners (radius proportional to shape size) | 2.35" H x 3.75" W | White/Gold: `#FBE3D6`; Silver: `#E8E8E8` | 0.75pt solid | -15% Brightness, +25% Contrast, 250% Saturation, 90° Rotation (applied programmatically during PPTX generation) | 8 | 1 |
| 7 | Box | Rectangle | 4.3" H x 6.25" W | None | N/A | 35% Sharpness, 130% Saturation, -10% Brightness | 2 | 1 |
| 8 | Wallet | Rectangle | 2.2" H x 3.5" W | `#FBE3D6` | 0.75pt solid | 35% Sharpness, -10% Brightness, +20% Contrast, 150% Saturation | 4 wallets (8 image placements) | 2 (front and back, same source file) |

### Grinder

| Parameter | Value |
| :--- | :--- |
| Shape | Circle crop |
| Dimensions | 2.45" diameter |
| Border | `#E8E8E8` |
| Border Weight | 0.75pt solid |
| Adjustments | -10% Brightness, +25% Contrast, 150% Saturation |
| Per Page | 12 |
| Images per SKU | 1 |

### Jar

| Parameter | Value |
| :--- | :--- |
| Shape | Circle crop |
| Dimensions | 2.65" diameter |
| Border | `#FBE3D6` |
| Border Weight | 0.75pt solid |
| Adjustments | 55% Sharpness |
| Per Page | 12 |
| Images per SKU | 1 |

### Tray

| Parameter | Value |
| :--- | :--- |
| Shape | (no crop) |
| Dimensions | 5.7" H x 4.05" W |
| Border | None |
| Adjustments | None |
| Per Page | 2 (intentionally overlapping diagonal composition; see `PPTX_Generation_and_Layout_Engine_Spec.md` for layout details) |
| Images per SKU | 1 |

### Lighter

| Parameter | Value |
| :--- | :--- |
| Shape | Rectangle with rounded corners (radius proportional to shape size) |
| Dimensions | 2.22" H x 1.42" W |
| Border | White/Gold: `#FBE3D6`; Silver: `#E8E8E8` |
| Border Weight | 0.75pt solid |
| Crop Behavior | Cover crop; image is scaled to cover the shape and cropped to fill, avoiding letterboxing while preserving aspect ratio (Decision #136) |
| Adjustments | -15% Brightness, +25% Contrast, 200% Saturation |
| Per Page | 10 lighters (20 image placements) |
| Images per SKU | 2 (front and back, same source file) |

### Ashtray

| Parameter | Value |
| :--- | :--- |
| Shape | Circle crop |
| Dimensions | 3.4" diameter |
| Border | `#E8E8E8` |
| Border Weight | 0.75pt solid |
| Adjustments | -25% Brightness, +35% Contrast, 300% Saturation, Flip Horizontal |
| Per Page | 6 |
| Images per SKU | 1 |

### Tin

| Parameter | Value |
| :--- | :--- |
| Shape | Rectangle with rounded corners (radius proportional to shape size) |
| Dimensions | 2.35" H x 3.75" W |
| Border | White/Gold: `#FBE3D6`; Silver: `#E8E8E8` |
| Border Weight | 0.75pt solid |
| Crop Behavior | Fit mode; image is scaled to fit fully within the shape and is never cropped |
| Adjustments | -15% Brightness, +25% Contrast, 250% Saturation, 90° Rotation (applied programmatically during PPTX generation) |
| Per Page | 8 |
| Images per SKU | 1 |

### Box

| Parameter | Value |
| :--- | :--- |
| Shape | Rectangle |
| Dimensions | 4.3" H x 6.25" W |
| Border | None |
| Crop Behavior | Crop to shape; image is cropped to completely fill the shape |
| Adjustments | 35% Sharpness, 130% Saturation, -10% Brightness |
| Per Page | 2 |
| Images per SKU | 1 |

### Wallet

| Parameter | Value |
| :--- | :--- |
| Shape | Rectangle |
| Dimensions | 2.2" H x 3.5" W |
| Border | `#FBE3D6` |
| Border Weight | 0.75pt solid |
| Crop Behavior | Fit mode; image is scaled to fit fully within the shape and is never cropped |
| Adjustments | 35% Sharpness, -10% Brightness, +20% Contrast, 150% Saturation |
| Per Page | 4 wallets (8 image placements) |
| Images per SKU | 2 (front and back, same source file) |

Per-product metadata text box rules:

| Product | Metadata Text Box |
| :--- | :--- |
| Lighter | Bottom text box indicating the lighter color (WHT, SIL, GLD). |
| Tin | Bottom text box indicating the tin color (WHT, SIL, GLD). |
| Grinder | Bottom text box reading "Grinder" — the slide's single product type (Decision #120). |
| Jar | Bottom text box reading "Jar" — the slide's single product type (Decision #120). |
| Tray | Bottom text box reading "Tray" — the slide's single product type (Decision #120). |
| All others | None. |

## Border Color Assignment

Border color for Lighter and Tin (White/Gold `#FBE3D6` vs. Silver `#E8E8E8`) is resolved independently per component from that component's own order SKU color code (`WHT`, `SIL`, `GLD`). It is not fixed at batch assignment: batches group by production group only (`Order_Status_and_Batch_Lifecycle_SOT.md`) and do not sub-group by color, so a single batch may contain both White/Gold and Silver components when the underlying orders differ in color. During PPTX slide assembly, however, Lighter and Tin components are grouped by SKU color code (`WHT`, `SIL`, `GLD`) into contiguous single-color slide runs, so a single generated slide never mixes color codes; `WHT` and `GLD` are grouped separately even though both resolve to the `#FBE3D6` border. Per Decision #121, superseding Decision #57's earlier allowance for same-page color mixing. See the Page Overflow Rule in `PPTX_Generation_and_Layout_Engine_Spec.md` for the slide-assembly mechanics.

## Same-Source-File Note

Four configurations share a single source artwork file across multiple component placements. The shared file is fetched once; per-component transformation parameters are applied independently to each placement.

For Lighter, the front (`LITF`) and back (`LITB`) placements use the same source artwork file at `artwork/Flip Lighter/{DESIGN_CODE}.png`.

For Wallet, the front (`WALF`) and back (`WALB`) placements use the same source artwork file at `artwork/Wallet/{DESIGN_CODE}.png`.

For LITTIN orders, the `TIN` print uses the same source artwork file as `LITF` and `LITB` at `artwork/Flip Lighter/{DESIGN_CODE}.png`. Tin transformation parameters, including the 90-degree rotation, are applied to this shared file during generation; the stored file is kept upright in Drive.

For ASHGRD orders, the `GRD` print uses the same source artwork file as `ASH` at `artwork/Ashtray/{DESIGN_CODE}.png`. The `GRD` placement receives Grinder transform parameters (2.45" circle crop, `#E8E8E8` border, and the Grinder color adjustments of -10% Brightness, +25% Contrast, 150% Saturation) drawn from the Grinder row in this document, not Ashtray parameters.

Source-file reuse principle: when a source file is shared between two components, the transform parameters applied per component are drawn exclusively from that component's own row in this document, not from the row corresponding to the file's primary product.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `PPTX_Generation_and_Layout_Engine_Spec.md` | Consumes these parameters when generating PPTX layouts. |
| `Production_Component_Decomposition_Rules.md` | The component codes routed to each batch group must match the per-product specs here. |
| `Data_Model_and_Database_Schema.md` | These parameters seed the `print_templates` table. |
