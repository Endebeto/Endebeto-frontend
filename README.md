# Endebeto frontend (Vite + React)

**Deployment:** This directory is the **root of the frontend GitHub repository** when you deploy to Vercel (`package.json` and `vercel.json` at the repo root—not under `endebeto-frontend/` on the remote).

## Deployment

- Env template: [.env.example](.env.example) — set `VITE_API_URL` in Vercel per environment (staging vs production APIs)
- SPA routing on Vercel: [vercel.json](vercel.json)
- Full staging/production guide (includes backend repo + Render): [../DEPLOYMENT.md](../DEPLOYMENT.md) (from the parent workspace that contains both folders)
