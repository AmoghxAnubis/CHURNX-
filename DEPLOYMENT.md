# Deployment

## Backend container

From the repository root:

```bash
docker build -t churnx-api .
docker run --rm -p 8000:8000 -e PORT=8000 -e ALLOWED_ORIGINS=https://YOUR-FRONTEND-DOMAIN -v churnx-history:/app/runtime churnx-api
```

The image runs as a non-root user and includes the serialized pipeline and metadata. The `PORT` variable is honored for container platforms. Model artifacts must be generated before building. A named volume preserves SQLite history; use one instance for this SQLite demonstration deployment. Configure a persistent disk on a hosting platform for history that survives redeployment.

Confirm `GET https://YOUR-API-DOMAIN/health` returns 200 before connecting the frontend. This workspace has no running Docker daemon, so the image definition is supplied but a local container build/run has not been verified.

## Frontend

Deploy the root Vite project to Vercel or another static host. Build command: `npm ci --include=dev && npm run build`; publish directory: `dist`. Set `VITE_API_URL=https://YOUR-API-DOMAIN` before building, then rebuild. Vite embeds the variable at build time. The local `/api` proxy is development-only and is not included in static hosting.

Update backend `ALLOWED_ORIGINS` to the exact frontend HTTPS origin, restart the API, then verify the Overview data, customer filtering, model metadata, and an individual prediction in the deployed application. Public deployment URLs have not been provisioned in this workspace; a hosting account and selected destination are required.

## Operation

Check `/monitoring` for process-level request count, server errors, latency and risk distribution. Review drift manually by comparing new profile distributions with the training data; automated drift detection and retraining remain future work. Retraining is a deliberate `python -m ml.train` operation, followed by metric review, model version change and service restart. Never replace the artifact solely because a training run finished.
