import { next } from "@vercel/edge";
import {
  extractExperienceMongoIdFromPath,
  isPreviewCrawlerUserAgent,
  tryOgResponseForExperiencePreview,
} from "./src/edge-shared/experienceLinkPreview";

/** Same-origin API proxy (Netlify: public/_redirects; Vercel: this middleware). */
function getSpaProxyOrigin(): string {
  const raw = (process.env.SPA_PROXY_API_ORIGIN || process.env.NETLIFY_API_ORIGIN || "").trim();
  return raw.replace(/\/$/, "");
}

/** Forward /api/* to Render (or other API host). Keeps JWT cookies on the Vercel origin (Brave-friendly). */
async function proxyApiToOrigin(request: Request, proxyOrigin: string): Promise<Response> {
  const url = new URL(request.url);
  const targetUrl = `${proxyOrigin}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  const method = request.method;
  const init: RequestInit & { duplex?: string } = {
    method,
    headers,
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD" && request.body) {
    init.body = request.body;
    init.duplex = "half";
  }

  return fetch(targetUrl, init);
}

const DEFAULT_PREVIEW_DESC = "Book authentic heritage experiences on Endebeto.";
const OG_FALLBACK_IMAGE_PATH = "/imgs/hero.jpg";

export const config = {
  matcher: ["/experiences/:id", "/api/:path*", "/sitemap.xml"],
};

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const proxyOrigin = getSpaProxyOrigin();

  if (
    proxyOrigin &&
    /^https:\/\//i.test(proxyOrigin) &&
    url.pathname.startsWith("/api/")
  ) {
    return proxyApiToOrigin(request, proxyOrigin);
  }

  // P2-23: serve the backend sitemap from the site's own origin.
  if (
    proxyOrigin &&
    /^https:\/\//i.test(proxyOrigin) &&
    url.pathname === "/sitemap.xml"
  ) {
    return fetch(`${proxyOrigin}/api/v1/sitemap.xml`);
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (!isPreviewCrawlerUserAgent(ua)) {
    return next();
  }

  const mongoId = extractExperienceMongoIdFromPath(url.pathname);
  if (!mongoId) {
    return next();
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);

  try {
    const og = await tryOgResponseForExperiencePreview({
      pageUrlStr: request.url,
      mongoId,
      metaApiEnv: process.env.EXPERIENCE_META_API_URL,
      viteApiEnv: process.env.VITE_API_URL,
      abortSignal: ctrl.signal,
      defaultDescription: DEFAULT_PREVIEW_DESC,
      defaultOgFallbackPath: OG_FALLBACK_IMAGE_PATH,
    });

    if (og) return og;

    return next();
  } catch {
    return next();
  } finally {
    clearTimeout(timeout);
  }
}
