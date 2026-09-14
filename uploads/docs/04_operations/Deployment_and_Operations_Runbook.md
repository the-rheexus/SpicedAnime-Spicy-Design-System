---
title: "Deployment and Operations Runbook"
version: "1.4"
status: "Pending Owner Verification"
last_verified: "2026-07-15"
owner: "SpicedAnime"
authors:
  - Josh
primary_systems:
  - SpicedAnime Fulfillment Web App
  - Production Batch Engine
  - Cloud File Storage
  - Shopify Admin API
database_dependencies:
  - product_families
  - configuration_components
  - print_templates
---

# Deployment and Operations Runbook

This document defines how to set up, deploy, and operate the SpicedAnime fulfillment web app across local, staging, and production environments. It covers Django, Next.js, PostgreSQL, Redis, Celery, and Google Drive setup, as well as safe deployment, backup, and recovery procedures.

This document does not define business rules, image specs, or any source-of-truth content. For those, see the cross-referenced documents at the end of this file.

---

## 1. Local Development Setup

Target platform: Apple Silicon M3, macOS, pyenv-managed Python 3.12.8, nvm-managed Node.js.

```bash
# Backend
cd backend
pyenv local 3.12.8
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_product_families  # custom command to load YAML
python manage.py runserver

# Background worker (separate terminal)
celery -A spicedanime worker -l info

# Frontend (separate terminal)
cd frontend
nvm use 26
npm install
npm run dev
```

Prerequisites:
- `pyenv` installed and `3.12.8` available (`pyenv install 3.12.8`).
- `nvm` installed and Node.js 26 available (`nvm install 26`).
- PostgreSQL running locally and the database created per the connection string in `.env`.
- Redis running locally (`brew services start redis` on macOS).
- A `.env` file in `backend/` populated from the Environment Variables Checklist in Section 4.


---

## 2. Staging Environment Setup

Staging mirrors production on Railway and Vercel, gated by branch.

**Railway (backend, PostgreSQL, Redis):**

- Create a Railway environment named `staging` within the same project as production.
- The `staging` environment auto-deploys from the `staging` branch.
- Provision the same service trio (Django web service, Celery worker service, PostgreSQL plugin, Redis plugin) as production.
- Populate env vars with staging values: a separate Shopify test store's webhook secret and API key, and `GOOGLE_DRIVE_ROOT_FOLDER_ID` pointing at a separate `SpicedAnime-Staging/` Drive folder.

**Vercel (frontend):**

- Vercel preview deployments are created automatically for every push to a non-`main` branch.
- Configure preview-scoped env vars (`NEXT_PUBLIC_API_BASE_URL` pointing at the Railway `staging` backend URL).

**Database migration:**

- Run the Section 5 migration sequence against the staging database the first time `staging` is deployed and after every schema-changing PR.

**Celery worker:**

- The Celery worker service in the Railway `staging` environment starts automatically; no manual command required.

---

## 3. Production Environment Setup

Production runs on Railway (backend, PostgreSQL, Redis) and Vercel (frontend) per Decision #28.

**Initial provisioning (one-time):**

1. Create a Railway project named `spicedanime-prod`.
2. Add a Django web service deployed from the `main` branch of the backend repository. Set the start command to `gunicorn spicedanime.wsgi --bind 0.0.0.0:$PORT`.
3. Add a Celery worker service from the same repository. Set the start command to `celery -A spicedanime worker -l info`.
4. Add the Railway PostgreSQL plugin. Railway injects `DATABASE_URL` automatically.
5. Add the Railway Redis plugin. Railway injects `REDIS_URL` automatically.
6. Configure all remaining env vars listed in Section 4 and in `Technical_Architecture_and_API_Contract.md` Environment Variables.
7. Create a Vercel project linked to the frontend repository's `main` branch.
8. Set Vercel env var `NEXT_PUBLIC_API_BASE_URL` to the Railway backend's public URL.

**First deploy:**

- Push the backend repository's `main` branch. Railway auto-deploys both the web and worker services.
- Run the Section 5 database migration sequence against the Railway PostgreSQL instance (one-time on first deploy and after every schema-changing PR).
- Register the Shopify webhook against the Railway backend URL per Section 6.
- Complete the Google Drive setup per Section 7 using a dedicated production service account.
- Push the frontend repository's `main` branch. Vercel auto-deploys.

**Railway service specifics:**

- The web service consumes `backend/Procfile` web entry. The worker service consumes the `backend/Procfile` worker entry. Set the service root directory to `backend` on both.
- Enable a public domain on the web service only. Do not expose the worker service publicly.
- Django settings auto-append `RAILWAY_PUBLIC_DOMAIN` (no scheme) to `ALLOWED_HOSTS` and the `https://` form to `CSRF_TRUSTED_ORIGINS`. Set `RAILWAY_PUBLIC_DOMAIN` on the web service to the value Railway assigns when the public domain is generated.

---

## 4. Environment Variables Checklist

The canonical list of all required environment variables and their descriptions is defined in `docs/02_app_specs/Technical_Architecture_and_API_Contract.md`. That document is the authoritative source for variable names, types, and permitted values. Credential handling rules are defined in `docs/02_app_specs/Security_Access_and_Privacy_Spec.md`.

The following variables are explicitly referenced in this runbook and must be set before running any setup steps:

| Variable | Set During | Notes |
| :--- | :--- | :--- |
| `SHOPIFY_WEBHOOK_SECRET` | Shopify Webhook Registration (Section 6) | HMAC SHA-256 secret for verifying incoming webhook payloads. |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Google Drive Setup (Section 7, Step 7) | ID of the `SpicedAnime/` root folder shared with the service account. |
| `GOOGLE_DRIVE_CREDENTIALS_JSON` | Google Drive Setup (Section 7, Step 8) | Full JSON contents of the service account key file. |
| `PACKING_EXPORT_RETENTION_DAYS` | Packing export retention | Optional restatement of the approved `30`-day policy; startup rejects invalid, zero, or negative values. |
| `RAILWAY_PUBLIC_DOMAIN` | Production Environment Setup (Section 3) | Public hostname of the Railway web service (no scheme). Auto-appended to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`. |
| `SHOPIFY_STORE_DOMAIN` | Production Environment Setup (Section 3) | Store domain, accepted as bare handle or `*.myshopify.com`. Required for live Shopify Admin order fetch and as the client-credentials OAuth token endpoint host. |
| `SHOPIFY_CLIENT_ID` | Production Environment Setup (Section 3) | Shopify custom app client ID. Set on **both** the backend service and the Celery worker service — the worker performs GRS metafield lookups independently during import. |
| `SHOPIFY_CLIENT_SECRET` | Production Environment Setup (Section 3) | Shopify custom app client secret. Set on both the backend and Celery worker services. Never logged or persisted. |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Production Environment Setup (Section 3) | Legacy static Shopify Admin API access token. Used by `ShopifyAdminClient` only when `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET` are not both set. `SHOPIFY_API_KEY` is a further fallback. |
| `SHOPIFY_API_VERSION` | Production Environment Setup (Section 3) | Shopify Admin API version string (e.g. `2026-04`). |

All remaining variables (database connection string, Django secret key, Shopify API credentials, etc.) are defined in `Technical_Architecture_and_API_Contract.md` and must be present in the environment before running `python manage.py migrate` or `npm run build`.

---

## 5. Database Migration

Run this sequence on first setup and after any schema-changing pull:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_product_families
python manage.py seed_configuration_components
python manage.py seed_print_templates
```

Notes:

- `seed_product_families` loads the 13-family dictionary from `docs/01_source_of_truth/production_component_rules.yaml` into the `product_families` table.
- `seed_configuration_components` loads the family-to-component mapping into the `configuration_components` table.
- `seed_print_templates` loads per-product image transformation parameters into the `print_templates` table.
- `seed_designs` is optional. `designs` rows are auto-created at order import time. Run `seed_designs` only to pre-populate human-readable `design_name` values before orders arrive for a new design code.
- Seed commands are idempotent. Re-running them on an already-seeded database will not duplicate rows.
- Always run `makemigrations` before `migrate` when pulling schema changes authored by another developer.

---

## 6. Shopify Webhook Registration

Register the webhook once per environment (staging and production each require their own registration).

| Setting | Value |
| :--- | :--- |
| Path | Shopify Admin → Settings → Notifications → Webhooks |
| Event | `Order paid` |
| Format | JSON |
| URL | `https://<railway-backend-domain>/api/webhooks/shopify/orders-paid/` |

Steps:

- Via Shopify Admin: Settings -> Notifications -> Webhooks.
- Event: `Order paid`.
- Format: JSON.
- URL: `https://<railway-backend-domain>/api/webhooks/shopify/orders-paid/`. Replace `<railway-backend-domain>` with the public domain assigned to the Railway web service before submitting registration.

After registration, copy the webhook signing secret Shopify generates and set it as `SHOPIFY_WEBHOOK_SECRET` in the environment. The Django endpoint validates every inbound payload against this secret using HMAC SHA-256.

---

## 7. Google Drive Setup

Complete this once per environment. A separate Google Cloud project or a separate service account may be used for staging vs. production.

1. Create a Google Cloud project.
2. Enable Google Drive API.
3. Create a service account with `https://www.googleapis.com/auth/drive` scope.
4. Generate and download a JSON key.
5. Create the `SpicedAnime/` root folder in Drive.
6. Inside `SpicedAnime/`, create the following subfolders: `artwork/`, `batches/`, `packing_sheets/`, `archives/`.
7. Inside `artwork/`, create the eight product category subfolders with these exact names (title case, with spaces): `Ashtray`, `Flip Lighter`, `Grinder Sets`, `Herb Grinder`, `Rolling Tray`, `Stash Box`, `Stash Jar`, `Wallet`. Do not create a `Tin` folder; TIN artwork is stored in `Flip Lighter`.
8. Within `Grinder Sets/`, series subfolders are created per series as artwork is added. Within each series subfolder, design code subfolders are created per design (e.g., `Grinder Sets/NARUTO/AKATSCLOUD/`).
9. Within `Stash Box/`, design subfolders are created per design (e.g., `Stash Box/AKATSCLOUD/`) containing per-component files (`BOX.png`, `LIT.png`, `GRD.png`, `JAR.png`).
10. Share the `SpicedAnime/` folder with the service account email (Editor access); subfolders inherit access.
11. Note the folder ID of `SpicedAnime/` and set as `GOOGLE_DRIVE_ROOT_FOLDER_ID`.
12. Store the JSON key contents in `GOOGLE_DRIVE_CREDENTIALS_JSON`.

---

## 8. Celery Worker Setup

### Development

Run both commands in separate terminal sessions alongside `python manage.py runserver` and `npm run dev`:

```bash
celery -A spicedanime worker -l info
celery -A spicedanime beat -l info  # if periodic tasks are added
```

Redis must be running before starting the worker. On macOS: `brew services start redis`.

### Production

- The Celery worker runs as a dedicated Railway service with the start command `celery -A spicedanime worker -l info`.
- The worker service requires its own copy of `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, and `SHOPIFY_STORE_DOMAIN` (or the legacy `SHOPIFY_ADMIN_ACCESS_TOKEN` fallback) — it performs GRS metafield lookups independently during order import and does not share the backend service's in-process token cache.
- Railway provides auto-restart on crash and log capture by default.
- Redeploy the worker service after every backend deployment to load updated task definitions. Railway redeploys the worker automatically when the backend repository's `main` branch is pushed.

The worker must be restarted after each deployment to pick up new task definitions.


---

## 9. Deployment Process

Deployment is `git push`-driven. Railway and Vercel each redeploy automatically on push to the relevant branch.

**Pre-deploy checklist:**

- All migrations from `python manage.py makemigrations` are committed.
- Env vars in Railway and Vercel match the canonical list in `Technical_Architecture_and_API_Contract.md`.
- Local test suite passes against the migration head.

**Deploy trigger:**

- Backend (Django + Celery worker): push to `main` of the backend repository. Railway redeploys both services.
- Frontend (Next.js): push to `main` of the frontend repository. Vercel redeploys.

**Post-deploy verification:**

- Railway health check on the backend service returns 200.
- Vercel deployment status is `Ready`.
- Test webhook delivery from the Shopify admin: confirm a 200 response from `/api/webhooks/shopify/orders-paid/`.
- Confirm the Celery worker service shows recent activity in Railway logs.

**Rollback:**

- Backend or worker: use Railway's deployment rollback to promote the previous successful deployment.
- Frontend: use Vercel's instant rollback to promote the previous successful deployment.
- For schema regressions: `git revert` the offending migration commit, then redeploy and re-run Section 5.

---

## 10. Backup Procedure

**Database:**

- Nightly `pg_dump` to encrypted storage.
- Retention: 30 days.

**Google Drive:**

- Native Drive version history serves as primary backup.
- TBD requires owner approval if additional backup is needed.

Restore procedure for the database: decrypt the target backup, then `pg_restore` against a provisioned PostgreSQL instance. After restore, verify by running the test suite against the restored data before routing production traffic.

---

## 11. Log Inspection

| Log Source | Location |
| :--- | :--- |
| Django application logs | Standard output captured by hosting platform. |
| Celery worker logs | Standard output captured by hosting platform. |
| Failed task inspection | `celery -A spicedanime events` or platform-native task viewer. |

In development, all logs print directly to the terminal sessions running each process. In staging and production, logs are captured by the hosting platform's log aggregation service (Railway captures backend and Celery logs; Vercel captures frontend logs).

To inspect failed Celery tasks in development:

```bash
celery -A spicedanime events
```

---

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `docs/02_app_specs/Technical_Architecture_and_API_Contract.md` | Defines the full stack and complete environment variable list that this runbook operates. |
| `docs/02_app_specs/Security_Access_and_Privacy_Spec.md` | Defines credential handling rules referenced in the Environment Variables Checklist. |
| `docs/01_source_of_truth/Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the Google Drive folder structure created during setup. |
