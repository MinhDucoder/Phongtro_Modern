Quick Docker setup for local development

This repository's backend can optionally use MeiliSearch (for search) and Redis (for caching). The easiest way to run them locally is via Docker Compose.

1) Prerequisites
   - Docker Desktop installed and running on Windows
   - (Optional) Docker Compose v2 (usually bundled with Docker Desktop)

2) Start services

Open a PowerShell in `server/` and run:

```powershell
# from repository root
cd E:\TestProject1\Phongtro_Modern\server

# Start MeiliSearch + Redis in background
docker compose up -d
```

3) Verify

```powershell
# Check containers
docker ps

# Check MeiliSearch health
Invoke-RestMethod http://127.0.0.1:7700/health

# Check MeiliSearch logs
docker logs meilisearch
```

4) .env

Copy `.env.example` to `.env` and fill in values (at minimum `MONGODB_URI`, `SESSION_SECRET`). The server defaults `MEILISEARCH_HOST` to `http://127.0.0.1:7700` and `MEILISEARCH_API_KEY` to `masterKey` which matches the docker-compose above.

5) Run server

```powershell
cd E:\TestProject1\Phongtro_Modern\server
npm install
npm run dev
```

Notes
- If you already run MeiliSearch elsewhere, set `MEILISEARCH_HOST`/`MEILISEARCH_API_KEY` in `.env` appropriately.
- MeiliSearch data is persisted to `server/meili_data` in this compose file. Adjust the path if you want the data elsewhere.
