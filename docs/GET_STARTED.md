# Get Started with OpenCASE

Deploy the full OpenCASE stack on a Debian-based Linux server (Ubuntu, Debian) running on Google Cloud, AWS, or any cloud provider.

By the end of this guide you will have:

- The **Editor** -- a visual canvas-based framework editor
- The **OpenCASE API** -- a multi-tenant CASE Provider API
- **Keycloak** -- an OIDC identity provider
- **Traefik** -- a reverse proxy tying it all together

All running with automatic HTTPS via Let's Encrypt, launched with one command.

---

## Prerequisites

- A Debian-based Linux server (Ubuntu 22.04+ or Debian 12+ recommended)
- SSH access to the server
- The server can reach the internet (for pulling images and packages)
- A **domain name** pointing to your server (e.g. `case.example.com`) -- Let's Encrypt cannot issue certificates for bare IP addresses
- Ports **80** and **443** open in your cloud firewall/security group (see [Step 4](#step-4--open-ports-80-and-443-in-your-cloud-firewall))

---

## Step 1 -- Install Docker, Docker Compose, and Git

Connect to your server via SSH:

```bash
ssh your-user@your-server-ip
```

### Update system packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Git

```bash
sudo apt install -y git
```

### Install Docker

```bash
# Install prerequisites
sudo apt install -y ca-certificates curl gnupg

# Add Docker's official GPG key (auto-detects Ubuntu vs Debian)
sudo install -m 0755 -d /etc/apt/keyrings
. /etc/os-release
curl -fsSL "https://download.docker.com/linux/${ID}/gpg" | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository (auto-detects distro and codename)
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} \
  ${VERSION_CODENAME} stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

> The commands above auto-detect whether you're on Ubuntu or Debian using `/etc/os-release`. The `${ID}` variable resolves to `ubuntu` or `debian` automatically.

### Allow your user to run Docker without sudo

```bash
sudo usermod -aG docker $USER
```

Log out and back in (or run `newgrp docker`) for the group change to take effect.

### Verify the installation

```bash
docker --version
docker compose version
git --version
```

You should see version output for all three commands.

---

## Step 2 -- Clone the Repository

### If the repository is public

```bash
git clone git@github.com:1EdTech/OpenCASE.git
cd OpenCASE
```

### If the repository is private

You need an SSH deploy key to give this server read access.

**On the server**, generate a key pair:

```bash
ssh-keygen -t ed25519 -C "opencase-deploy-key" -f ~/.ssh/opencase_deploy -N ""
```

Print the public key:

```bash
cat ~/.ssh/opencase_deploy.pub
```

**On GitHub**, add the public key as a deploy key:

1. Go to the repository on GitHub
2. **Settings** > **Deploy keys** > **Add deploy key**
3. Title: e.g. `GCP Server`
4. Paste the public key
5. Leave **"Allow write access"** unchecked
6. Click **Add key**

**Back on the server**, configure SSH to use this key for GitHub:

```bash
echo 'Host github.com
  IdentityFile ~/.ssh/opencase_deploy
  IdentitiesOnly yes' >> ~/.ssh/config

chmod 600 ~/.ssh/config
```

Now clone via SSH:

```bash
git clone git@github.com:nicktcouper/opencase.git
cd opencase
```

---

## Step 3 -- Create the Environment File

Copy the provided template to `.env` in the project root:

```bash
cp docs/env.example .env
```

The `.env` file is the single source of truth for all configuration -- networking mode (HTTP vs HTTPS), hostnames, ports, and service settings. Both `docker-compose.yml` and `docker-compose.dev.yml` read from it.

### Choose TLS mode

The `.env` file defaults to **HTTPS mode** (TLS on port 443 with Let's Encrypt). This is the right choice for a server with a domain name. The top of the file has a mode toggle:

```
# --- HTTPS (production) ---
TRAEFIK_CONFIG=traefik/traefik-https.yml
TRAEFIK_PORTS_WEB=443:443
TRAEFIK_PORTS_ALT=80:80
KC_HOSTNAME_STRICT_HTTPS=true
OPENCASE_SCHEME=https
OPENCASE_PORT_SUFFIX=

# --- HTTP (local development) ---
# TRAEFIK_CONFIG=traefik/traefik-http.yml
# TRAEFIK_PORTS_WEB=3000:3000
# TRAEFIK_PORTS_ALT=8080:8080
# KC_HOSTNAME_STRICT_HTTPS=false
# OPENCASE_SCHEME=http
# OPENCASE_PORT_SUFFIX=:3000
```

To switch to **HTTP mode** (plain HTTP on port 3000, no TLS), comment out the HTTPS block and uncomment the HTTP block. All URLs are constructed automatically from these base variables -- no other changes needed.

### Set your domain name

Edit the `OPENCASE_HOSTNAME` variable in `.env`:

```
OPENCASE_HOSTNAME=case.example.com
```

That's it -- all URLs (OIDC issuer, SPA redirect URIs, SMTP from address, etc.) are constructed automatically from `OPENCASE_HOSTNAME`, `OPENCASE_SCHEME`, and `OPENCASE_PORT_SUFFIX` inside `docker-compose.yml`. No need to edit anything else.

> **Important:** HTTPS mode requires a domain name. Let's Encrypt cannot issue certificates for bare IP addresses. If you only have an IP, switch to HTTP mode.

### Set the Let's Encrypt email

Edit the `ACME_EMAIL` variable in `.env` to a valid email address. Let's Encrypt uses this for certificate expiry warnings:

```
ACME_EMAIL=you@example.com
```

### Set the admin password (recommended)

Edit the `ADMIN_PASSWORD` variable to change the shared password used by Keycloak admin, the system admin user, and all service credentials:

```
ADMIN_PASSWORD=your-strong-password
```

### Verify your changes

Spot-check a few values:

```bash
grep OPENCASE_HOSTNAME .env
grep ADMIN_PASSWORD .env
grep ACME_EMAIL .env
grep TRAEFIK_CONFIG .env
```

You should see your domain in `OPENCASE_HOSTNAME`, your password in `ADMIN_PASSWORD`, your email in `ACME_EMAIL`, and the HTTPS Traefik config selected.

---

## Step 4 -- Open Ports 80 and 443 in Your Cloud Firewall

The application serves HTTPS on port **443**. Port **80** is also required for HTTP-to-HTTPS redirect and for the Let's Encrypt HTTP-01 certificate challenge.

### Google Cloud

```bash
gcloud compute firewall-rules create allow-opencase \
  --allow tcp:80,tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow OpenCASE web traffic (HTTP + HTTPS)"
```

### AWS (Security Group)

```bash
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_SECURITY_GROUP_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id YOUR_SECURITY_GROUP_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

Alternatively, configure this through the cloud console UI.

> **HTTP mode:** If you chose HTTP mode in Step 3, open port **3000** instead of 80/443.

> **Optional ports** you may also want to open for administration:
> - **8025** -- Mailpit email UI (development email viewer)

---

## Step 5 -- Start OpenCASE

From the project root (`opencase/`), run:

```bash
docker compose up --build
```

The first run will:

1. Build the Editor and OpenCASE Docker images
2. Pull Traefik, Keycloak, and Mailpit images
3. Start all five services
4. Obtain a TLS certificate from Let's Encrypt (HTTPS mode, automatic)
5. Automatically configure Keycloak (realm, clients, system admin user)

This takes a few minutes on the first run. You'll see logs from all services streaming in the terminal. In HTTPS mode, Traefik requests a certificate from Let's Encrypt during startup -- this usually completes within 30-60 seconds. Check `docker compose logs -f traefik` if you want to monitor it.

> **Tip:** To run in the background (detached mode):
> ```bash
> docker compose up --build -d
> ```
> Then view logs with:
> ```bash
> docker compose logs -f
> ```

---

## Step 6 -- Verify It's Running

Once the logs settle and you see the OpenCASE and Editor services are healthy, open your browser and navigate to:

**HTTPS mode:**

| URL | What |
|-----|------|
| `https://YOUR_DOMAIN` | Editor UI |
| `https://YOUR_DOMAIN/health` | API health check |
| `https://YOUR_DOMAIN/admin/` | Keycloak Admin Console |

**HTTP mode:**

| URL | What |
|-----|------|
| `http://YOUR_HOST:3000` | Editor UI |
| `http://YOUR_HOST:3000/health` | API health check |
| `http://YOUR_HOST:3000/admin/` | Keycloak Admin Console |

The health check endpoint should return a JSON response confirming the API is running. In HTTPS mode, HTTP requests to port 80 are automatically redirected to HTTPS.

---

## Step 7 -- Log In

OpenCASE bootstraps a system admin account on first startup:

| Field | Value |
|-------|-------|
| Email | `system-admin@local` (or the `KEYCLOAK_SYSTEM_ADMIN_EMAIL` from `.env`) |
| Password | The `ADMIN_PASSWORD` from `.env` (default: `admin`) |

Open the Editor UI and sign in with these credentials.

To access the Keycloak Admin Console directly:

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | The `ADMIN_PASSWORD` from `.env` (default: `admin`) |

> **Important:** Set a strong `ADMIN_PASSWORD` in `.env` before first startup, especially if the server is publicly accessible.

---

## Managing the Stack

### Stop all services

```bash
docker compose down
```

### Stop and remove all data (clean slate)

```bash
docker compose down -v
```

### Restart after code changes

```bash
docker compose up --build
```

### View logs for a specific service

```bash
docker compose logs -f opencase
docker compose logs -f editor
docker compose logs -f keycloak
```

### Switch between HTTP and HTTPS

Edit `.env` and toggle the TLS mode block at the top of the file (see [Step 3](#choose-tls-mode)). The TLS block sets the scheme and port, and all URLs are constructed automatically -- no other variables need to change. Then restart:

```bash
docker compose down
docker compose up --build
```

---

## Architecture Overview

All traffic enters through **Traefik**, which routes requests by path. In HTTPS mode, Traefik terminates TLS and redirects HTTP to HTTPS:

```
HTTPS mode:
  Browser --> :443 HTTPS (Traefik, Let's Encrypt TLS)
  Browser --> :80 HTTP  --> 301 redirect --> :443 HTTPS

HTTP mode:
  Browser --> :3000 HTTP (Traefik)
```

```
┌──────────────────────────────────────────────┐
│                   Traefik                    │
│     (HTTPS :443 + :80  or  HTTP :3000)       │
├──────────────────────────────────────────────┤
│  /           --> Editor    (React + Vite)    │
│  /ims/*      --> OpenCASE  (Express API)     │
│  /realms/*   --> Keycloak  (OIDC Provider)   │
└──────────────────────────────────────────────┘
         │              │              │
   ┌─────▼────┐   ┌─────▼────┐   ┌────▼─────┐
   │  Editor  │   │ OpenCASE │   │ Keycloak │
   │  :5173   │   │  :8080   │   │  :8080   │
   └──────────┘   └──────────┘   └────┬─────┘
                                      │ SMTP
                                 ┌────▼─────┐
                                 │ Mailpit  │
                                 │  :8025   │
                                 └──────────┘
```

---

## Data Persistence

Framework data is stored on the host filesystem via a bind mount:

```
apps/opencase/data/tenants/{tenantId}/v1p1/
├── frameworks/{docId}/
│   ├── {docId}_v0001.json
│   └── {docId}_v0002.json
└── indexes/
    ├── documents.json
    └── items.json
```

Keycloak data (users, realm configuration) is stored in a Docker named volume (`keycloak_data`).

TLS certificates (HTTPS mode) are stored in a Docker named volume (`letsencrypt_data`).

To back up framework data, simply copy the `apps/opencase/data/` directory.

---

## Troubleshooting

### TLS certificate errors (HTTPS mode)

If the browser shows a certificate warning or Traefik logs show ACME errors:

1. Verify your **domain name** has a DNS A record pointing to the server's IP: `dig +short YOUR_DOMAIN`
2. Verify ports **80** and **443** are open in your firewall -- Let's Encrypt uses port 80 for the HTTP-01 challenge
3. Verify `ACME_EMAIL` is set in `.env`
4. Verify `TRAEFIK_CONFIG` points to `traefik/traefik-https.yml`
5. Check Traefik logs: `docker compose logs -f traefik`
6. If you hit Let's Encrypt rate limits during testing, add the staging CA server to `traefik/traefik-https.yml` under `certificatesResolvers.letsencrypt.acme`:

```yaml
caServer: https://acme-staging-v02.api.letsencrypt.org/directory
```

### Keycloak takes a long time to start

This is normal on first boot. Keycloak initializes its database and imports configuration. Subsequent starts are faster.

### "Connection refused" from browser

1. Check that the correct ports are open in your cloud firewall (80/443 for HTTPS mode, 3000 for HTTP mode)
2. Verify all containers are running: `docker compose ps`
3. Check logs for errors: `docker compose logs -f`

### OIDC/authentication errors after changing hostname

Verify `OPENCASE_HOSTNAME` is set correctly in `.env`:

```bash
grep OPENCASE_HOSTNAME .env
```

Since all URLs are constructed from this single variable, fixing it here fixes all service URLs. Then restart with `docker compose down && docker compose up --build`.

### Containers keep restarting

Check the logs for the specific container: `docker compose logs -f opencase`. Common causes:
- Keycloak not ready yet (OpenCASE depends on it) -- wait a minute and it should resolve
- Permission errors on the data directory -- ensure `apps/opencase/data/` is writable

---

## Next Steps

- **Change default passwords** for both Keycloak admin and the system admin user
- **Create a tenant** via the Editor UI to start building frameworks
- **Import existing CASE frameworks** using the CLI import tool (`npm run import-framework` inside the OpenCASE container)
- Read the [Editor README](../apps/editor/README.md) and [OpenCASE README](../apps/opencase/README.md) for detailed documentation
