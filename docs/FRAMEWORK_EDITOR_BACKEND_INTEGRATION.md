# OpenCASE Backend Integration Guide (for a Framework Editor)

This document is intended as **integration context** for a separate “framework editor / visual flow editor” that:

- edits frameworks locally
- converts them to **1EdTech CASE** format
- uses **OpenCASE** as the backend for persistence + serving via the CASE Provider API

---

## What this project provides

OpenCASE exposes three relevant HTTP surfaces:

- **OAuth service** (get JWT access tokens): `/oauth/*` and `/.well-known/oauth-authorization-server`
- **CASE Provider API (read-only, spec-aligned)**: `/ims/case/v1p1/*` (and v1p0 in the project, but v1p1 is the primary path in `src/interfaces/http/server.ts`)
- **Non-standard Management API (write operations)**: `/management/*` (update/delete + tenant/account/client management)
- **Admin “authoring” endpoints**: `/admin/*` (not the HTML admin UI; these are JSON endpoints for creating/importing framework bundles)

All framework data is persisted **to disk** under `data/tenants/<tenantId>/v1p1/...` (and/or `v1p0`).

---

## Base URL and discovery

- **Default server base URL**: `http://localhost:8080`
- **OpenAPI discovery (no auth)**:
  - `GET /ims/case/v1p1/discovery/imscasev1p1_openapi3_v1p0.json`
- **OAuth discovery (no auth)**:
  - `GET /.well-known/oauth-authorization-server`

---

## Authentication requirements (what your editor must do)

### Summary

- **All** routes under:
  - `/ims/case/*`
  - `/admin/*`
  - `/management/*`
  require an `Authorization: Bearer <JWT>` header.
- The OAuth routes (`/oauth/*` and `/.well-known/*`) and the OpenAPI discovery JSON are **not authenticated**.

### Browser SPA recommendation: OAuth2 Authorization Code + PKCE

Because your editor runs **in the browser** (React + react-flow), you should **not** embed a `client_secret` in the frontend. Use `authorization_code` with **PKCE** so the SPA can obtain a JWT access token without a secret.

OpenCASE supports:

- `GET|POST /oauth/authorize` with PKCE (`code_challenge`, `code_challenge_method`)
- `POST /oauth/token` exchange with PKCE (`code_verifier`)

**Important (current behavior):** `/oauth/authorize` does **not** render a login UI. It expects `email` + `password` in the **POST body**, then issues a **302 redirect** to your `redirect_uri` with `?code=...` (and `&state=...` if provided).

#### Step 0: Create a SPA OAuth client (grant type)

Your OAuth client must include `authorization_code` in its `grantTypes`. In this repo, clients live in `data/oauth/clients.json` (see also `OAUTH_USAGE.md`).

For a SPA, you can set a placeholder secret (it won’t be used for the auth-code exchange in this implementation), e.g.:

```json
{
  "clientId": "my-spa",
  "clientSecret": "unused",
  "tenantId": "demo",
  "grantTypes": ["authorization_code"],
  "scopes": ["case.read", "case.write"],
  "active": true
}
```

#### Step 1: Generate PKCE values in the browser

- `code_verifier`: random high-entropy string
- `code_challenge`: base64url(SHA256(code_verifier)) for `S256`

Store the `code_verifier` (and `state`) in session storage until callback.

#### Step 2: Start authorization (login) via **form POST**

Because the authorize endpoint needs email/password in the body and then redirects, the most reliable SPA approach is to submit a form (not `fetch`) so the browser follows the redirect naturally.

POST to:

- `/oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=...&state=...&code_challenge=...&code_challenge_method=S256`

Body fields:

- `email`
- `password`

#### Step 3: Handle the redirect on your SPA callback route

Your `redirect_uri` receives:

- `?code=...`
- `&state=...` (if supplied)

#### Step 4: Exchange code for token

`POST /oauth/token` with:

- `grant_type=authorization_code`
- `client_id=...`
- `code=...`
- `redirect_uri=...`
- `code_verifier=...`

The response includes:

- `access_token` (JWT)
- `token_type=Bearer`
- `expires_in`
- optionally `refresh_token` (if refresh-token support is enabled)

#### Step 5: Call OpenCASE APIs with the token

Add:

- `Authorization: Bearer <access_token>`

to all `/ims/case/*`, `/admin/*`, and `/management/*` calls.

### Alternative (recommended for production): BFF / token broker

If you don’t want your SPA to ever handle OpenCASE tokens (or you want to avoid cross-origin redirect edge cases), put a small **backend-for-frontend (BFF)** in front:

- SPA authenticates with your IdP (or a cookie session)
- BFF calls OpenCASE using `client_credentials` (keeps `client_secret` on the server)
- BFF proxies `/ims/case/*` + the write operations needed by the editor

This also gives you a single place to enforce editor-specific authorization rules.

### Dev/Postman shortcut: OAuth2 Client Credentials

Your editor (or your editor’s companion backend) should request tokens using `client_credentials`.

**Token endpoint**

- `POST /oauth/token`
- Content-Type: `application/x-www-form-urlencoded`

**Example (curl)**

```bash
curl -X POST http://localhost:8080/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=demo-client" \
  -d "client_secret=demo-secret" \
  -d "scope=case.read case.write"
```

**Use the token**

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  http://localhost:8080/ims/case/v1p1/CFDocuments
```

### Default OAuth client (dev/test)

On first run, OpenCASE initializes OAuth storage under `data/oauth/` and provides a default client (see `OAUTH_USAGE.md`):

- **client_id**: `demo-client`
- **client_secret**: `demo-secret`
- **tenantId claim**: `demo`

### JWT requirements (what must be in the token)

The API uses a JWT verifier that requires:

- **RS256**
- **issuer** matches configured issuer
- **audience** matches configured audience

Tokens issued by OpenCASE include:

- `tenantId` (used to scope which tenant’s frameworks you can access)
- `scope` (space-separated OAuth scopes, used by some management routes)
- `aud` (audience)

### Tenant scoping behavior

- For **management routes** (e.g. `/management/tenants/:tenantId/...`), controllers enforce **tenant mismatch protection**: the `tenantId` in the token must match the `:tenantId` in the URL.
- For **CASE read routes** (`/ims/case/v1p1/...`), the tenant is derived from the token’s `tenantId` (with a fallback default of `demo` if missing).

### Scopes (what’s enforced in code)

Scopes exist and are returned in tokens, and **some** endpoints enforce them:

- `case.admin` is enforced for:
  - `GET /management/tenants`
  - `POST /management/tenants`
- `case.owner` is enforced for account management under:
  - `/management/tenants/:tenantId/accounts/*`
- `case.owner` **or** `case.admin` is enforced for OAuth client management under:
  - `/management/tenants/:tenantId/clients/*`

As of the current code, the write endpoints for updating CASE entities:

- `PUT/DELETE /management/tenants/:tenantId/CFDocuments/:id`
- `PUT/DELETE /management/tenants/:tenantId/CFItems/:id`
- `PUT/DELETE /management/tenants/:tenantId/CFAssociations/:id`

do **not** additionally require `case.write` at the router level (they still require a valid JWT and correct tenant).

---

## How to list and consume frameworks (read side)

### Option A (recommended for editors): list frameworks via Management API

**List frameworks for a tenant**

- `GET /management/tenants/{tenantId}/frameworks?caseVersion=1.1`
- Returns metadata including `sourcedId` (document id) + `caseVersion`.

Use this to drive your editor’s “open framework” picker.

### Option B (CASE standard listing): list CFDocuments

**List CFDocuments**

- `GET /ims/case/v1p1/CFDocuments`
- This is the CASE provider listing endpoint (read-only).

### Load a framework for editing/viewing

If your editor wants the entire framework in one request (document + items + associations + rubrics + definitions):

**Get CFPackage (complete bundle)**

- `GET /ims/case/v1p1/CFPackages/{documentSourcedId}`

This is usually the simplest “open framework” call for an editor UI.

---

## How to create or edit frameworks (write side)

### Key design point: versioned “bundle writes”

OpenCASE stores each framework as **versioned files on disk**. Each write produces a new version file like:

`data/tenants/<tenantId>/v1p1/frameworks/<docId>/<docId>_v0001.json`

This means you can implement editing in two main ways:

- **Bundle publish approach (best for “save/publish” from an editor)**:
  - send a full bundle (document + items + associations + rubrics + definitions)
  - OpenCASE writes a **new immutable version**
- **Entity update approach (best for small edits to existing IDs)**:
  - update a single CFDocument / CFItem / CFAssociation
  - OpenCASE rewrites the framework bundle as a new version, but only changes the targeted entity

### Create / publish a full framework bundle (supports adding NEW items/associations)

**Endpoint**

- `POST /admin/tenants/{tenantId}/frameworks?caseVersion=1.1`

**Body shape expected by OpenCASE**

```json
{
  "document": { /* CASE CFDocument JSON */ },
  "items": [ /* CASE CFItem JSON[] */ ],
  "associations": [ /* CASE CFAssociation JSON[] */ ],
  "rubrics": [ /* CFRubric[] (passed through) */ ],
  "definitions": { /* CFDefinitions (optional, passed through) */ }
}
```

**Important**

- The CFDocument’s `sourcedId` (or `identifier`) determines the framework id (`docId`) used in:
  - `/ims/case/v1p1/CFDocuments/{docId}`
  - `/ims/case/v1p1/CFPackages/{docId}`
- Calling this endpoint again with the same `document.sourcedId` will create **another** version on disk (i.e., “publish new revision”).

### Import a framework bundle from a remote endpoint (optional)

**Endpoint**

- `POST /admin/tenants/{tenantId}/frameworks/import?caseVersion=1.1`

**Body**

```json
{
  "endpointUrl": "https://example.org/ims/case/v1p1/CFPackages/<docId>",
  "accessToken": "optional bearer token to fetch the remote package",
  "validateSchema": false,
  "schemaName": "optional schema name override"
}
```

Returns `{ docId, version }` on success.

### Update existing entities (only works for existing IDs)

These are non-standard endpoints meant for editor-style updates.

**Update CFDocument**

- `PUT /management/tenants/{tenantId}/CFDocuments/{docId}?caseVersion=1.1`
- Body: **raw CFDocument JSON** (not wrapped)

**Update CFItem**

- `PUT /management/tenants/{tenantId}/CFItems/{itemId}?caseVersion=1.1`
- Body: **raw CFItem JSON**

**Update CFAssociation**

- `PUT /management/tenants/{tenantId}/CFAssociations/{associationId}?caseVersion=1.1`
- Body: **raw CFAssociation JSON**

**Delete**

- `DELETE /management/tenants/{tenantId}/CFDocuments/{docId}?caseVersion=1.1`
- `DELETE /management/tenants/{tenantId}/CFItems/{itemId}?caseVersion=1.1`
- `DELETE /management/tenants/{tenantId}/CFAssociations/{associationId}?caseVersion=1.1`

**Note on “creating” new items/associations**

There is no dedicated `POST /CFItems` or `POST /CFAssociations` management endpoint in the current server. To add new items/associations, use the **bundle publish** endpoint:

- `POST /admin/tenants/{tenantId}/frameworks`

### Recommended editor workflow

- **Open**:
  - `GET /management/tenants/{tenantId}/frameworks?caseVersion=1.1`
  - `GET /ims/case/v1p1/CFPackages/{docId}`
- **Edit in UI** (local state)
- **Save**:
  - for “publish revision / adds new nodes/edges”: `POST /admin/tenants/{tenantId}/frameworks` with full bundle
  - for “edit an existing node/edge”: `PUT /management/tenants/{tenantId}/CFItems/{id}` / `.../CFAssociations/{id}` / `.../CFDocuments/{id}`
- **Refresh/canonicalize**:
  - re-fetch `GET /ims/case/v1p1/CFPackages/{docId}` after saving so the UI state matches persisted data

---

## Data model notes (what your editor should map to)

- **Framework**: CASE `CFDocument` (id = `sourcedId`)
- **Nodes**: CASE `CFItem` (id = `sourcedId`)
- **Edges**: CASE `CFAssociation` (id = `sourcedId`)
  - edges point at items via `originNodeURI.identifier` and `destinationNodeURI.identifier`

---

## Operational notes

- Persistence is file-based; if you want isolated environments, use separate `CASE_DATA_DIR` values or separate tenantIds.
- CORS is permissive in `src/interfaces/http/server.ts` (useful for local dev from a separate editor app).

