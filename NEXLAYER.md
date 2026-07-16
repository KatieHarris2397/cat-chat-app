# Nexlayer — cat-chat-app

<!-- nexlayer:meta version=1 analyzed=2026-06-09T23:28:49Z repo=https://github.com/KatieHarris2397/cat-chat-app branch=main -->

> **For AI agents (Claude Code, Cursor, Gemini CLI, Copilot):**
> This file is the **project context** for this Nexlayer deployment — tech stack, env vars, secrets, live URL.
> For full platform detail (nexlayer.yaml schema, Dockerfile rules, CI/CD, task recipes) read **`nexlayer.skills`** in this repo.
>
> **Critical rules (full detail in `nexlayer.skills`):**
> - Inter-pod refs: `${podName:port}` only — never `localhost` or bare hostnames
> - Docker Hub images: prefix with `mirror.gcr.io/library/` — bare tags fail on the cluster
> - Secrets: set in the Nexlayer dashboard — never commit to `nexlayer.yaml` or Dockerfile
>
> **This file:** `agent-managed` sections update automatically. `user-editable` sections (Local Development Setup, Nexlayer Deployment Plan, Build Notes) are yours — preserved across re-analysis.

## Project Summary
<!-- nexlayer:section agent-managed=project_summary -->
A real-time, cat-themed chat application utilizing WebSockets for instant messaging and PostgreSQL for persistent chat history, featuring a three-tier architecture with React, Node.js, and PostgreSQL.
<!-- nexlayer:end -->

## Technology Stack
<!-- nexlayer:section agent-managed=tech_stack -->
| Name | Kind | Version | Detected From |
|------|------|---------|---------------|
| React | framework | latest | frontend |
| Node.js | language | 18+ | backend |
| Express | framework | latest | backend |
| Socket.io | tool | latest | backend, frontend |
| PostgreSQL | database | 15 | database |
| Nginx | infra | latest | README.md |
<!-- nexlayer:end -->

## Repository Structure
<!-- nexlayer:section agent-managed=structure_map -->
- frontend/ — React client application
- backend/ — Node.js Express server with Socket.io
- database/ — PostgreSQL initialization scripts
<!-- nexlayer:end -->

## External Services Required
<!-- nexlayer:section agent-managed=external_deps -->
_No external services detected._
<!-- nexlayer:end -->

## Local Development Setup
<!-- nexlayer:section user-editable=local_setup -->
### Prerequisites

- Node.js >= 18
- npm or yarn
- Docker >= 20.10

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
POSTGRES_DB=catchat
DATABASE_URL=postgresql://localhost:5432/catchat
```

### Steps

1. `docker build -t cat-chat-db ./database` — Build database image
2. `docker build -t cat-chat-backend ./backend` — Build backend image
3. `docker build -t cat-chat-frontend ./frontend` — Build frontend image
4. `docker network create cat-chat-network` — Create shared network

<!-- nexlayer:end -->

## Nexlayer Setup
<!-- nexlayer:section agent-managed=nexlayer_setup -->
### Pod Environment Variables

| Pod | Variable | Value | Kind |
|-----|----------|-------|------|
| `"backend"` | `PORT` | `"3001"` | plain |
| `"backend"` | `DB_HOST` | `"database.pod"` | plain |
| `"backend"` | `DB_PORT` | `"5432"` | plain |
| `"backend"` | `DB_NAME` | `"catchat"` | plain |
| `"backend"` | `DB_USER` | `"postgres"` | plain |
| `"backend"` | `DB_PASSWORD` | `"${DB_PASSWORD}"` | inter-pod |
| `"backend"` | `CLIENT_URL` | `"<% URL %>"` | plain |
| `"database"` | `POSTGRES_DB` | `"catchat"` | plain |
| `"database"` | `POSTGRES_USER` | `"postgres"` | plain |
| `"database"` | `POSTGRES_PASSWORD` | _(set via Nexlayer dashboard)_ | secret |
| `"database"` | `PGDATA` | `"/var/lib/postgresql/data"` | plain |
| `cat-chat-postgres-data` | `size` | `"2Gi"` | plain |
| `cat-chat-postgres-data` | `mountPath` | `"/var/lib/postgresql"` | plain |

### Secrets Required

Set these in the Nexlayer dashboard before deploying:

- `POSTGRES_PASSWORD` (`"database"` pod)

### nexlayer.yaml

```yaml
application:
  name: cat-chat
  pods:
    # Frontend - React app with Nginx reverse proxy
    - name: "frontend"
      image: "registry.nexlayer.io/nexlayer-mcp/nexlayer/cat-chat-frontend:f51be2b"
      path: "/"
      servicePorts: [80]

    # Backend - Node.js + Express + Socket.io server
    - name: "backend"
      image: "registry.nexlayer.io/nexlayer-mcp/nexlayer/cat-chat-backend:f51be2b"
      servicePorts: [3001]
      vars:
        PORT: "3001"
        DB_HOST: "database.pod"
        DB_PORT: "5432"
        DB_NAME: "catchat"
        DB_USER: "postgres"
        DB_PASSWORD: "${DB_PASSWORD}"
        CLIENT_URL: "<% URL %>"

    # Database - PostgreSQL 15
    - name: "database"
      image: "registry.nexlayer.io/nexlayer-mcp/nexlayer/cat-chat-database:f51be2b"
      servicePorts: [5432]
      vars:
        POSTGRES_DB: "catchat"
        POSTGRES_USER: "postgres"
        POSTGRES_PASSWORD: "postgres"
        PGDATA: "/var/lib/postgresql/data"
      volumes:
        - name: cat-chat-postgres-data
          size: "2Gi"
          mountPath: "/var/lib/postgresql"
```
<!-- nexlayer:end -->

## Nexlayer Deployment Plan
<!-- nexlayer:section user-editable=deployment_plan -->
### Pod Topology

| Pod | Image | Port | Role |
|-----|-------|------|------|
| cat-chat-db | mirror.gcr.io/library/postgres:15-alpine | 5432 | database |
| cat-chat-backend | mirror.gcr.io/library/node:18-alpine | 3000 | web |
| cat-chat-frontend | mirror.gcr.io/library/node:18-alpine | 80 | web |

### Inter-pod environment variables

- `cat-chat-backend` pod: `DATABASE_URL=${cat-chat-db:5432}`
- `cat-chat-frontend` pod: `BACKEND_URL=${cat-chat-backend:3000}`

### Deployment notes

- Backend pod uses ${cat-chat-db:5432} for PostgreSQL connectivity
- Frontend pod uses ${cat-chat-backend:3000} for API and WebSocket routing
- All images migrated to mirror.gcr.io to comply with Nexlayer platform rules

<!-- nexlayer:end -->

## Build Notes
<!-- nexlayer:section user-editable=build_notes -->
<!-- Add notes for future builds here — preserved across re-analysis -->
<!-- nexlayer:end -->

## Nexlayer Configuration
<!-- nexlayer:section agent-managed=nexlayer_config -->
**Last deployed:** 2026-07-16T18:51:56Z  
**Live URL:** https://kitbear-studio-cat-chat.cloud.nexlayer.ai  
**Runtime:**  · **Port:** auto-detected  
**Deploy branch:** nexlayer  

```yaml
application:
  name: cat-chat
  pods:
    # Frontend - React app with Nginx reverse proxy
    - name: "frontend"
      image: "registry.nexlayer.io/nexlayer-mcp/nexlayer/cat-chat-frontend:f51be2b"
      path: "/"
      servicePorts: [80]

    # Backend - Node.js + Express + Socket.io server
    - name: "backend"
      image: "registry.nexlayer.io/nexlayer-mcp/nexlayer/cat-chat-backend:f51be2b"
      servicePorts: [3001]
      vars:
        PORT: "3001"
        DB_HOST: "database.pod"
        DB_PORT: "5432"
        DB_NAME: "catchat"
        DB_USER: "postgres"
        DB_PASSWORD: "${DB_PASSWORD}"
        CLIENT_URL: "<% URL %>"

    # Database - PostgreSQL 15
    - name: "database"
      image: "registry.nexlayer.io/nexlayer-mcp/nexlayer/cat-chat-database:f51be2b"
      servicePorts: [5432]
      vars:
        POSTGRES_DB: "catchat"
        POSTGRES_USER: "postgres"
        POSTGRES_PASSWORD: "postgres"
        PGDATA: "/var/lib/postgresql/data"
      volumes:
        - name: cat-chat-postgres-data
          size: "2Gi"
          mountPath: "/var/lib/postgresql"
```
<!-- nexlayer:end -->

## Build History
<!-- nexlayer:section agent-managed=build_history -->
| Date | Status | Notes |
|------|--------|-------|
| 2026-07-16T18:45:19Z | analyzed | initial repo analysis |
| 2026-07-16T18:51:56Z | success | deployed https://kitbear-studio-cat-chat.cloud.nexlayer.ai |
<!-- nexlayer:end -->

