/**
 * Netlify: writes public/_redirects before vite build.
 * If SPA_PROXY_API_ORIGIN (or legacy NETLIFY_API_ORIGIN) is https://api-host, proxies /api/* there
 * so the browser stays same-origin (strict cookie browsers). Else SPA fallback only.
 * Pair with VITE_API_URL=/api/v1. Vercel uses middleware.ts; Netlify uses
 * netlify/edge-functions/experience-link-preview.ts — set EXPERIENCE_META_API_URL
 * (same as .env.example) so link previews fetch the backend from Edge.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outFile = path.join(root, "public", "_redirects");
const spaFallback = "/*    /index.html   200";

function proxyOrigin() {
  const raw = (process.env.SPA_PROXY_API_ORIGIN || process.env.NETLIFY_API_ORIGIN || "").trim();
  return raw.replace(/\/$/, "");
}

const apiOrigin = proxyOrigin();
let contents;
if (apiOrigin && /^https:\/\//i.test(apiOrigin)) {
  contents = `/api/*    ${apiOrigin}/api/:splat    200\n${spaFallback}`;
  console.log(`[write-netlify-redirects] /api/* → ${apiOrigin}/api/*`);
} else {
  if (apiOrigin && !/^https:\/\//i.test(apiOrigin)) {
    console.warn("[write-netlify-redirects] proxy origin must be https:// — using SPA fallback only");
  }
  contents = spaFallback;
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${contents}\n`, "utf8");
