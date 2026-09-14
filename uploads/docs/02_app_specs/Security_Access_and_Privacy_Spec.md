---
title: "Security Access and Privacy Spec"
version: "1.4"
status: "Pending Owner Verification"
last_verified: "2026-09-02"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - Shopify Admin API
  - SpicedAnime Fulfillment Web App
  - Cloud File Storage
database_dependencies:
  - orders
  - generated_files
  - audit_events
---

# Security Access and Privacy Spec

## Primary Purpose

Defines authentication, Shopify credential handling, Google Drive credential handling, customer PII handling, file access rules, audit log requirements, and the future role-based access model.

## Thick Boundaries

- **Must Cover:** MVP auth method, Shopify and Drive credential storage, customer PII fields and retention, file access rules, audit event list, future role table.
- **Must Consider:** MVP is single-user (Josiah). Multi-user roles are deferred but the data model should accommodate them.
- **Explicitly Excludes:** Business rules, image specs, workflow narrative.

## Authentication

Authentication (MVP):

- Single admin login.
- Django's built-in authentication.
- Owner (Josiah) is the only initial user.
- Password reset via email.

## Credential Storage

Credential storage:

| Credential | Storage Method | Environment Variable |
| :--- | :--- | :--- |
| Shopify webhook secret | Environment variable, server-side only | `SHOPIFY_WEBHOOK_SECRET` |
| Shopify client-credentials pair (preferred) | Environment variable, server-side only, on both the backend and Celery worker services | `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` |
| Shopify Admin API access token (legacy fallback) | Environment variable, server-side only | `SHOPIFY_ADMIN_ACCESS_TOKEN`, `SHOPIFY_API_KEY` |
| Google Drive service account JSON | Environment variable, server-side only | `GOOGLE_DRIVE_CREDENTIALS_JSON` |
| Django secret key | Environment variable | `SECRET_KEY` |
| Database connection string | Environment variable | `DATABASE_URL` |
| Redis URL (Celery broker) | Environment variable | `REDIS_URL` |


## Customer PII Handling

Customer PII fields:

| Field | Source | Retention | Operator-Facing Access |
| :--- | :--- | :--- | :--- |
| `orders.customer_name` | Shopify | Indefinite (until owner deletes order) | Required for Packing Queue / packing-sheet output. Not exposed on Orders or Order Detail. |
| `orders.customer_email` | Shopify | Indefinite | Admin only; existing Order Detail access is unchanged. |
| `orders.shipping_address` | Shopify | Indefinite | Admin only; existing Order Detail access is unchanged. |

**Customer-name exposure boundary (Decision #94):**

- `orders.customer_name` remains stored and imported because packing-sheet output requires it.
- Orders does not display customer name.
- The Orders list API does not expose customer name.
- Order Detail does not display customer name.
- `GET /api/orders/{id}/` does not return `customer_name`.
- Packing Queue and generated packing-sheet output continue using the stored customer name as already specified.
- This restriction applies specifically to customer name. Existing customer-email and shipping-address behavior is unchanged.
- Decision #94 changes exposure only; it does not delete, redact, migrate, or shorten retention of the stored `orders.customer_name` value.

Retention policy:

- MVP: Indefinite retention; owner manages deletion manually.
- Post-MVP: TBD requires owner approval if a formal retention policy is needed.
- Completed packing-sheet XLSX outputs are a distinct approved exception: retain the output and its packing-sheet PII for exactly 30 calendar days from successful finalization, then delete the Drive packing-sheet object before marking the database row purged. Failed deletion remains retryable and is never reported as purged. This does not define order, backup, Drive-version, legal-hold, or customer-request retention.
- Sandbox test orders (`is_sandbox = true`, Decision #47) contain synthetic, non-customer data only; they are exempt from the 30-day packing-sheet retention rule (they are excluded from packing-sheet export selection entirely) and are retained indefinitely until manually cleared by the operator via the Sandbox screen or `seed_sandbox_orders` reset.

Admin authentication uses django-axes with a direct `REMOTE_ADDR` client address, a five-attempt threshold, one-hour cooloff, and reset on successful authentication. Login success, failure, and lockout are audited without passwords, hashes, cookies, CSRF tokens, authorization headers, sessions, request bodies, or service credentials.

## File Access Rules

File access rules:

- Generated PPTX and XLSX files are stored in the SpicedAnime Google Drive folder.
- Drive folder permissions are managed by the Drive owner (Josiah).
- The app's service account has write access to the SpicedAnime folder tree.
- Public sharing of generated files is disabled by default.

## Integration Status Endpoint Safety

The `GET /api/settings/integration-status/` endpoint is session-authenticated and read-only. It returns only booleans, ISO 8601 datetime strings or `null`, and one safe metadata string (`shopify.api_version`). The following values are never included in the response body under any circumstances:

- `SHOPIFY_STORE_DOMAIN` value
- `SHOPIFY_CLIENT_ID` or `SHOPIFY_CLIENT_SECRET` value
- `SHOPIFY_ADMIN_ACCESS_TOKEN` or `SHOPIFY_API_KEY` value
- `SHOPIFY_WEBHOOK_SECRET` value
- Any Shopify OAuth access token acquired via the client-credentials exchange
- `GOOGLE_DRIVE_CREDENTIALS_JSON` value (in any form)
- `GOOGLE_DRIVE_ROOT_FOLDER_ID` value
- Any Shopify order payload data
- Any customer PII (`customer_name`, `customer_email`, `shipping_address`)

The `shopify.connected` boolean is a presence-only check against required environment variables — a complete client-credentials pair (`SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`), or the static fallback (`SHOPIFY_ADMIN_ACCESS_TOKEN` or `SHOPIFY_API_KEY`) only when no client-credentials pair is present. A partial client-credentials pair (only one of the two set) reports as disconnected. This check does not perform a live Shopify Admin API call and does not verify that credentials actually work.

The `celery.worker_reachable` boolean is derived from a bounded (1.0 second timeout) `celery.control.inspect().ping()` call wrapped so any exception (no broker, no worker, network error) degrades to `false`. It never dispatches a task.

The safety invariant is enforced by the automated regression test `test_no_secret_values_present_in_response` in `test_settings_integration_status_api.py`, which asserts the raw JSON response body never contains the configured store domain, access token, webhook secret, or Drive folder ID values. Any future addition to the endpoint's response shape must preserve this invariant and extend the regression test accordingly.

Anonymous requests to this endpoint return HTTP 403.

## Audit Event List

Audit event list:

| Event | Logged Fields |
| :--- | :--- |
| Order imported | `shopify_order_id`, timestamp, source IP |
| Component generated | `component_id`, `order_item_id`, `family`, `config` |
| Batch locked (Generate PPTX) | `batch_id`, user, timestamp |
| Batch printed (Mark Printed) | `batch_id`, user, timestamp |
| Packing sheet exported | `packing_export_id`, user, timestamp |
| Artwork uploaded | `artwork_asset_id`, user, timestamp, file path |
| SKU created or modified | `offer_sku_id`, user, change details |
| Component flagged for reprint | `component_id`, user, timestamp |
| Sandbox data reset | user, timestamp, count of orders/components created |
| Sandbox PPTX regenerated | `batch_id`, user, timestamp |
| Login attempt (success or failure) | user, IP, timestamp |


## Future Roles (Post-MVP)

Future roles (Post-MVP):

| Role | Capabilities |
| :--- | :--- |
| Owner/Admin | Everything. |
| Production Operator | Generate batches, mark printed, view orders. |
| Packaging Operator | View packing queue, export packing sheets, mark packed. |
| Viewer | Read-only access. |

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Technical_Architecture_and_API_Contract.md` | Defines the environment variable list and authenticated API surfaces constrained by this privacy spec. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines Drive credential usage. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines Shopify credential usage and the import behavior that persists customer-name data. |
| `Packing_Sheet_Export_Spec.md` | Defines the approved Packing Queue / XLSX use of stored customer-name data. |
| `Web_App_Screen_Inventory_and_UX_Flow.md` | Defines the Orders and Order Detail surfaces from which customer name is excluded by Decision #94. |
| `Decision_Log_and_Open_Questions.md` | Decision #94 is the authority for the customer-name exposure restriction. |
