import { next } from "@vercel/edge";

/** Match common link-preview fetchers; omit generic Googlebot so crawl stays on the SPA. */
const CRAWLER_UA =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|vkShare|Embedly|redditbot|Applebot/i;

const RESERVED_SEGMENTS = new Set([
  "mine",
  "pending",
  "summary",
  "experience-stats",
  "catalog-price-bounds",
  "admin",
]);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteImageUrl(image: string | undefined, requestUrl: string): string | null {
  if (image == null || image === "" || image === "__draft__") return null;
  if (/^https?:\/\//i.test(image)) return image;
  const origin = new URL(requestUrl).origin;
  return image.startsWith("/") ? `${origin}${image}` : `${origin}/${image}`;
}

export const config = {
  matcher: ["/experiences/:id"],
};

export default async function middleware(request: Request): Promise<Response> {
  const ua = request.headers.get("user-agent") ?? "";
  if (!CRAWLER_UA.test(ua)) {
    return next();
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[0] !== "experiences") {
    return next();
  }

  const id = segments[1];
  if (RESERVED_SEGMENTS.has(id) || !/^[a-f0-9]{24}$/i.test(id)) {
    return next();
  }

  const apiBaseRaw =
    process.env.EXPERIENCE_META_API_URL?.trim() ||
    process.env.VITE_API_URL?.trim() ||
    "";
  if (!apiBaseRaw) {
    return next();
  }

  const apiBase = apiBaseRaw.replace(/\/$/, "");
  const apiUrl = `${apiBase}/experiences/${id}`;

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);

  try {
    const res = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });

    if (!res.ok) {
      return next();
    }

    const json: unknown = await res.json();
    const exp =
      json &&
      typeof json === "object" &&
      "data" in json &&
      json.data &&
      typeof json.data === "object" &&
      "data" in json.data
        ? (json.data as { data: Record<string, unknown> }).data
        : null;

    if (!exp || typeof exp !== "object") {
      return next();
    }

    const title = typeof exp.title === "string" ? exp.title : "Experience";
    let description = "";
    if (typeof exp.summary === "string") description = exp.summary;
    else if (typeof exp.description === "string") {
      description = exp.description.slice(0, 320);
    }
    description = description.trim().slice(0, 320);

    let rawCover = "";
    if (typeof exp.imageCover === "string") rawCover = exp.imageCover;
    else if (Array.isArray(exp.images) && exp.images.length > 0) {
      const first = exp.images[0];
      if (typeof first === "string") rawCover = first;
    }

    const canonical = `${url.origin}${url.pathname}`;
    const ogImage =
      absoluteImageUrl(rawCover, request.url) ?? `${url.origin}/imgs/hero.jpg`;

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description || "Book authentic heritage experiences on Endebeto.");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeTitle} — Endebeto</title>
<meta name="description" content="${safeDesc}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDesc}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:image" content="${escapeHtml(ogImage)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDesc}" />
<meta name="twitter:image" content="${escapeHtml(ogImage)}" />
</head>
<body><p><a href="${escapeHtml(canonical)}">${safeTitle}</a></p></body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return next();
  } finally {
    clearTimeout(timeout);
  }
}
