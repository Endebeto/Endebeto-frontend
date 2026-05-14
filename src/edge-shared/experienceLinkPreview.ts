/**
 * Shared link-preview (Open Graph) HTML for `/experiences/:mongoId`.
 * Used by Vercel `middleware.ts` and Netlify Edge — no Node-only APIs.
 */

export const RESERVED_EXPERIENCE_PATH_SEGMENTS = new Set([
  "mine",
  "pending",
  "summary",
  "experience-stats",
  "catalog-price-bounds",
  "admin",
]);

/** Match common link-preview fetchers; omit generic Googlebot so crawl stays on the SPA. */
export const PREVIEW_CRAWLER_UA =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Messenger|Instagram|Slackbot|Discordbot|Pinterest|vkShare|Embedly|redditbot|Applebot|MicrosoftPreview|Outlook|SkypeUriPreview/i;

export function isPreviewCrawlerUserAgent(userAgent: string): boolean {
  return PREVIEW_CRAWLER_UA.test(userAgent);
}

export function escapeHtmlLinkPreview(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function absoluteImageUrlForOg(
  image: string | undefined,
  pageUrl: string,
): string | null {
  if (image == null || image === "" || image === "__draft__") return null;
  if (/^https?:\/\//i.test(image)) return image;
  const origin = new URL(pageUrl).origin;
  return image.startsWith("/") ? `${origin}${image}` : `${origin}/${image}`;
}

/**
 * Resolved absolute URL for `GET …/experiences/:id` (matches backend `/api/v1/experiences/:id`).
 */
export function resolveExperienceMetaFetchUrl(
  experienceId: string,
  deployPageUrl: string,
  env: {
    experienceMetaApiUrl?: string | undefined;
    viteApiUrl?: string | undefined;
  },
): string | null {
  const raw =
    env.experienceMetaApiUrl?.trim() || env.viteApiUrl?.trim() || "";
  if (!raw) return null;

  const base = raw.replace(/\/$/, "");
  const restPath = `/experiences/${experienceId}`;
  if (/^https?:\/\//i.test(base)) {
    return `${base}${restPath}`;
  }
  const pathPrefix = base.startsWith("/") ? base : `/${base}`;
  return new URL(`${pathPrefix}${restPath}`, new URL(deployPageUrl).origin).href;
}

/** Parse pathname → Mongo ObjectId segment for `/experiences/:id`. */
export function extractExperienceMongoIdFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[0] !== "experiences") return null;

  const id = segments[1];
  if (RESERVED_EXPERIENCE_PATH_SEGMENTS.has(id) || !/^[a-f0-9]{24}$/i.test(id)) {
    return null;
  }
  return id;
}

/** Body shape from `handlerFactory.getOne` → `{ data: { data: doc } }`. */
export function parseExperienceFromGetOneJson(json: unknown): Record<string, unknown> | null {
  const exp =
    json &&
    typeof json === "object" &&
    "data" in json &&
    json.data &&
    typeof json.data === "object" &&
    "data" in json.data
      ? (json.data as { data: Record<string, unknown> }).data
      : null;

  return exp && typeof exp === "object" ? exp : null;
}

export function buildOgHtml(props: {
  title: string;
  descriptionForMeta: string;
  canonicalHref: string;
  pageUrlStr: string;
  rawCover: string;
  defaultOgFallbackPath: string;
}): string {
  const { title, descriptionForMeta, canonicalHref, pageUrlStr, rawCover, defaultOgFallbackPath } =
    props;

  const ogImage =
    absoluteImageUrlForOg(rawCover, pageUrlStr) ??
    new URL(defaultOgFallbackPath, new URL(pageUrlStr).origin).href;

  const safeTitle = escapeHtmlLinkPreview(title);
  const safeDesc = escapeHtmlLinkPreview(descriptionForMeta);
  const safeCanonical = escapeHtmlLinkPreview(canonicalHref);
  const escImg = escapeHtmlLinkPreview(ogImage);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeTitle} — Endebeto</title>
<meta name="description" content="${safeDesc}" />
<link rel="canonical" href="${safeCanonical}" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDesc}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${safeCanonical}" />
<meta property="og:image" content="${escImg}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDesc}" />
<meta name="twitter:image" content="${escImg}" />
</head>
<body><p><a href="${safeCanonical}">${safeTitle}</a></p></body>
</html>`;
}

/** Fetch listing JSON and build OG HTML Response, or `null` to fall through. */
export async function tryOgResponseForExperiencePreview(opts: {
  pageUrlStr: string;
  mongoId: string;
  metaApiEnv: string | undefined;
  viteApiEnv: string | undefined;
  abortSignal?: AbortSignal;
  defaultDescription: string;
  defaultOgFallbackPath: string;
}): Promise<Response | null> {
  const {
    pageUrlStr,
    mongoId,
    metaApiEnv,
    viteApiEnv,
    abortSignal,
    defaultDescription,
    defaultOgFallbackPath,
  } = opts;

  const apiUrl = resolveExperienceMetaFetchUrl(mongoId, pageUrlStr, {
    experienceMetaApiUrl: metaApiEnv,
    viteApiUrl: viteApiEnv,
  });
  if (!apiUrl) return null;

  const res = await fetch(apiUrl, {
    headers: { Accept: "application/json" },
    signal: abortSignal,
  });
  if (!res.ok) return null;

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return null;
  }

  const exp = parseExperienceFromGetOneJson(json);
  if (!exp) return null;

  const title = typeof exp.title === "string" ? exp.title : "Experience";

  let description = "";
  if (typeof exp.summary === "string") description = exp.summary;
  else if (typeof exp.description === "string") {
    description = exp.description.slice(0, 320);
  }
  description = description.trim().slice(0, 320);
  const descriptionForMeta = description || defaultDescription;

  let rawCover = "";
  if (typeof exp.imageCover === "string") rawCover = exp.imageCover;
  else if (Array.isArray(exp.images) && exp.images.length > 0) {
    const first = exp.images[0];
    if (typeof first === "string") rawCover = first;
  }

  const urlObj = new URL(pageUrlStr);
  const canonical = `${urlObj.origin}${urlObj.pathname}`;

  const html = buildOgHtml({
    title,
    descriptionForMeta,
    canonicalHref: canonical,
    pageUrlStr,
    rawCover,
    defaultOgFallbackPath,
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
