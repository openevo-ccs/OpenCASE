# OpenCASE Monorepo

An open-source toolkit for working with [1EdTech CASE](https://www.imsglobal.org/activity/case) (Competencies & Academic Standards Exchange) frameworks:

- **OpenCASE** (`apps/opencase`) — A multi-tenant CASE Provider API (Node.js/Express)
- **Editor** (`apps/editor`) — A visual canvas-based framework editor (React + React Flow)

## Quick Start

Start all services with a single command:

```bash
docker-compose up --build
```

Access the application at: **http://localhost:3000**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser → :3000                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      Traefik                                │
│                   (Reverse Proxy)                           │
├─────────────────────────────────────────────────────────────┤
│  /                    → Editor (React SPA)                  │
│  /ims/*, /management/* → OpenCASE (API)                     │
│  /realms/*, /admin/*  → Keycloak (Auth)                     │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │  Editor   │   │ OpenCASE  │   │ Keycloak  │
    │  (Vite)   │   │ (Express) │   │  (OIDC)   │
    └───────────┘   └───────────┘   └─────┬─────┘
                                          │ SMTP
                                    ┌─────▼─────┐
                                    │  Mailpit  │
                                    │  (:8025)  │
                                    └───────────┘
```

## Services

| Service | Internal Port | Description |
|---------|---------------|-------------|
| Traefik | 3000 | Reverse proxy (main entry point) |
| Traefik Dashboard | 8080 | Traefik admin UI |
| Editor | 5173 | React frontend with hot-reload |
| OpenCASE | 8080 | CASE API backend |
| Keycloak | 8080 | OIDC identity provider |
| Mailpit | 8025 / 1025 | Dev email capture (Web UI / SMTP) |

## URLs

| URL | What |
|-----|------|
| http://localhost:3000 | Editor UI |
| http://localhost:3000/ims/case/v1p1/CFDocuments | CASE API |
| http://localhost:3000/health | API health check |
| http://localhost:3000/admin/ | Keycloak Admin Console |
| http://localhost:8080 | Traefik Dashboard |
| http://localhost:8025 | Mailpit UI (dev emails) |

## Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| Keycloak Admin | admin | admin |
| System Admin | system-admin@local | admin |

## Email & Password Management

### Mailpit (Dev Email)

All transactional emails (password resets, etc.) are captured by [Mailpit](https://github.com/axllent/mailpit) in development. No emails leave the local environment.

- **Web UI**: http://localhost:8025 — view all captured emails
- **SMTP**: `mailpit:1025` (internal Docker network)

Mailpit starts automatically with `docker-compose up`. The OpenCASE backend configures Keycloak's SMTP settings to point at Mailpit on startup.

### Forgot Password

Click **"Forgot password?"** on the login screen. This redirects to Keycloak's reset-credentials page, which sends a password reset email. In development, the email is captured by Mailpit — open http://localhost:8025 to find the reset link.

### Change Password

Authenticated users can change their password via the user menu (available on both the home screen and the editor). Clicking **"Change password"** opens the Keycloak account console in a new tab.

## Development

### Dev Mode (Hot Reload for All Apps)

For active development with hot-reload on both Editor and OpenCASE:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This enables:
- **Editor**: Vite HMR - edit `apps/editor/src/*` → instant reload
- **OpenCASE**: ts-node-dev - edit `apps/opencase/src/*` → auto-restart

First time or after changing dependencies:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Production Mode

For production-like builds (no hot-reload):

```bash
docker-compose up --build
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f editor
docker-compose logs -f opencase
docker-compose logs -f keycloak
```

### Rebuilding

```bash
# Rebuild all services
docker-compose up --build

# Rebuild specific service
docker-compose up --build opencase
```

### Stopping

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Routing

Traefik routes requests based on path:

| Path Pattern | Service | Description |
|--------------|---------|-------------|
| `/` | editor | React SPA (catch-all, lowest priority) |
| `/ims/*` | opencase | CASE Provider API (read) |
| `/management/*` | opencase | Management API (write) |
| `/oauth/*` | opencase | OAuth endpoints |
| `/public/*` | opencase | Public endpoints (tenant lookup) |
| `/health` | opencase | Health check |
| `/.well-known/*` | opencase | OAuth/OIDC discovery |
| `/realms/*` | keycloak | OIDC authentication |
| `/admin/*` | keycloak | Keycloak admin console |
| `/resources/*` | keycloak | Keycloak static assets |

## Configuration

See `docs/env.example` for available environment variables. Copy it to `.env` to customize:

```bash
cp docs/env.example .env
```

The `.env` file is the single source of truth — `docker-compose.yml` reads all configurable values from it. For remote server deployment, see the [Get Started Guide](docs/GET_STARTED.md).

## Testing

### Editor (`apps/editor`)

```bash
cd apps/editor
npm run test          # Single run
npm run test:watch    # Watch mode
```

Tests cover the pure domain and layout logic — reducer, geometry helpers, layout algorithms, topology detection, and factories. See the [Editor README](apps/editor/README.md) for details.

### OpenCASE (`apps/opencase`)

```bash
cd apps/opencase
npm run test          # Single run
npm run test:watch    # Watch mode
```

## Project Structure

```
monorepo/
├── docker-compose.yml        # Production-like environment
├── docker-compose.dev.yml    # Dev overrides (hot-reload)
├── env.example               # Environment variable template
├── AGENTS.md                 # AI assistant guidance
├── README.md                 # This file
└── apps/
    ├── editor/               # React frontend
    │   ├── Dockerfile
    │   ├── src/
    │   │   ├── app/          # App shell, providers, routing
    │   │   ├── domain/       # CASE entities (Framework, Item, Association)
    │   │   ├── application/  # Use-cases, mappers, ports
    │   │   ├── infrastructure/ # API clients, persistence
    │   │   └── ui/
    │   │       ├── editor/
    │   │       │   ├── state/          # EditorContext (React provider)
    │   │       │   │   ├── helpers/    # Pure geometry & adjacency utils
    │   │       │   │   ├── editorReducer.ts  # Pure state reducer
    │   │       │   │   └── editorFactories.ts
    │   │       │   ├── layout/         # Pure layout algorithms
    │   │       │   │   ├── hierarchyLayout.ts
    │   │       │   │   ├── starLayout.ts
    │   │       │   │   ├── treeLayout.ts
    │   │       │   │   ├── detectTopology.ts
    │   │       │   │   └── applyInitialLayout.ts
    │   │       │   ├── reactflow/      # React Flow types, mapping, components
    │   │       │   └── components/     # Canvas, header, dialogs
    │   │       └── home/               # Home screen, framework cards
    │   └── ...
    └── opencase/             # Node.js backend
        ├── Dockerfile
        ├── Dockerfile.dev
        ├── data/             # Persisted framework data
        └── ...
```

## Learn More

- [Get Started Guide](docs/GET_STARTED.md) — Deploy on a Linux server (Docker)
- [Editor README](apps/editor/README.md) — How the frontend works
- [Editor Architecture](apps/editor/docs/architecture.md) — Design decisions, folder structure, contributing guide
- [OpenCASE README](apps/opencase/README.md) — Backend API documentation
