# Kwil Docker Deployment Troubleshooting Log

**Date:** 2026-01-06
**Status:** 🔴 Blocked (Container failing to start)

## Objective
Deploy a local Kwil node using Docker Compose to serve as the State Layer database for the Neo Agent.

## Current Issue
The `kwild` container (`neo_kwil_node`) fails to start, repeatedly logging the following error:
```
no private key provided, generating a new one...
Error: failed to build chain syncer: unsupported chain code: Local
```

This indicates that the node is attempting to initialize with a default Chain ID of "Local", which is apparently not supported by the chain synchronizer in this version of the software.

## Attempted Solutions

### 1. Image Updates
- **Original:** `kwilteam/kwil-db:v0.9.3` (Image not found/Access denied)
- **Updated:** `kwildb/kwil:latest` (Official image found on Docker Hub)
- **Postgres:** Switched to `kwildb/postgres:latest` to ensure compatibility and pre-installed extensions.

### 2. Configuration Flags
- Removed the `--autogen` flag from the `command` instruction in `docker-compose.yml`, as it was causing an `unknown flag` error in the `latest` image.

### 3. Environment Variables (Chain ID)
We attempted to force a supported Chain ID (`kwil-chain-1` and `neo-net`) using various environment variable permutations, suspecting a naming convention mismatch:
- `KWIL_CHAIN_ID`
- `KWILD_CHAIN_ID`
- `CHAIN_ID`
- `KWILD_CHAIN_CONFIG_CHAIN_ID`

**Result:** The error persisted unchanged, suggesting the container's internal entrypoint script might be ignoring these variables or defaulting to "Local" before reading them.

### 4. Database ID Calculation
- Created `scripts/pre-calc-id.ts` to deterministically calculate the `KWIL_DB_ID` based on the wallet address and database name, ensuring the `.env` file has the correct target ID for deployment.
- **Calculated ID:** `x71c2a0c98bd65f5b9375dd59c4bf793b983c5c450c26cf3b9dbb13cc`

## Technical Details

### `docker-compose.yml` (Current State)
```yaml
services:
  kwil:
    image: kwildb/kwil:latest
    container_name: neo_kwil_node
    entrypoint: /app/kwild
    command: start
    environment:
      - KWIL_DB_HOST=postgres
      - KWIL_DB_PORT=5432
      - KWIL_DB_USER=kwil
      - KWIL_DB_PASSWORD=kwilpassword
      - KWIL_DB_NAME=kwil_db
      - KWIL_CHAIN_ID=kwil-chain-1
      # ... (and other permutations)
```

### Connection Error
The Node.js deployment script (`scripts/deploy-kwil.ts`) fails with `ECONNREFUSED` because the Kwil container crashes immediately after starting, so port `8080` remains closed.

## Next Steps / Recommendations
1.  **Identify Stability Version:** The `latest` tag might be unstable or require a specific config file layout. We need to find a specific, stable version tag (e.g., `v0.8.x` or `v0.9.x`) that is confirmed to work with Docker Compose.
2.  **Manual Genesis Generation:** Instead of relying on auto-generation, we may need to manually run `kwild setup` locally to generate `genesis.json` and `config.toml`, then mount these files into the container via Docker volumes.
3.  **Alternative Registries:** Check if the official stable images are hosted on a different registry (e.g., GitHub Container Registry `ghcr.io` or `quay.io`).
