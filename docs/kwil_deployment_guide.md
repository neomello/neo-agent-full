# Kwil Docker Deployment Guide (Local)

**Status:** ✅ Solved & Operational
**Last Updated:** 2026-01-06

## Objective
Deploy a local Kwil node using Docker Compose to serve as the State Layer database for the Neo Agent.

## The Solution (Summary)
We successfully deployed the node by:
1.  **Downgrading to Stable Version:** Used `kwildb/kwil:v0.6.1` instead of `latest` (which had issues with `autogen` and environment variables).
2.  **Correct Bind Address:** Explicitly configured the node to listen on `0.0.0.0` instead of `localhost` (default) so Docker port mapping works.
3.  **Chain ID Synchronization:** Retrieved the auto-generated `chain_id` from the node and updated the client configuration.

## Prerequisite Configuration

### `docker-compose.yml`
Ensure your service is configured as follows to allow external access and data persistence:

```yaml
services:
  kwil:
    image: kwildb/kwil:v0.6.1
    ports:
      - "8080:8080"   # API/Gateway
      - "50051:50051" # gRPC
    environment:
      - KWILD_DB_HOST=postgres
      # ... (DB credentials)
    
    # CRITICAL: Binds listeners to 0.0.0.0 to accept connections from host
    command: [ "--autogen", "--app.http-listen-addr=0.0.0.0:8080", "--app.grpc-listen-addr=0.0.0.0:50051", "--app.admin-listen-addr=/tmp/kwil_admin.sock" ]

    volumes:
      - ./kwil-nodes/config:/root/.kwild  # Note: v0.6 uses .kwild (with 'd')
```

### Retrieving the Chain ID
Since `autogen` creates a random Chain ID, you must retrieve it after the first boot:

1.  **Start the node:** `docker-compose up -d`
2.  **Extract Genesis:** 
    ```bash
    docker cp neo_kwil_node:/root/.kwild/genesis.json .
    cat genesis.json
    ```
3.  **Update `.env`:** Copy the `chain_id` value (e.g., `kwil-chain-QUt1ZMlq`) to `KWIL_CHAIN_ID`.

## Deployment
Run the deployment script to push the schema:
```bash
npx ts-node scripts/deploy-kwil.ts
```

## Useful Commands
*   **Check Logs:** `docker logs -f neo_kwil_node`
*   **Check Status:** `curl http://localhost:8080/status`
*   **Reset Node:** `docker-compose down -v && rm -rf kwil-nodes`
