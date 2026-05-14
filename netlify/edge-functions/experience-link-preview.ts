import type { Config, Context } from "@netlify/edge-functions";
import {
  extractExperienceMongoIdFromPath,
  isPreviewCrawlerUserAgent,
  tryOgResponseForExperiencePreview,
} from "../../src/edge-shared/experienceLinkPreview.ts";

const DEFAULT_PREVIEW_DESC = "Book authentic heritage experiences on Endebeto.";
const OG_FALLBACK_IMAGE_PATH = "/imgs/hero.jpg";

export default async (request: Request, context: Context): Promise<Response> => {
  const ua = request.headers.get("user-agent") ?? "";
  if (!isPreviewCrawlerUserAgent(ua)) {
    return context.next();
  }

  const url = new URL(request.url);
  const mongoId = extractExperienceMongoIdFromPath(url.pathname);
  if (!mongoId) {
    return context.next();
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);

  try {
    const og = await tryOgResponseForExperiencePreview({
      pageUrlStr: request.url,
      mongoId,
      metaApiEnv: Netlify.env.get("EXPERIENCE_META_API_URL") || undefined,
      viteApiEnv: Netlify.env.get("VITE_API_URL") || undefined,
      abortSignal: ctrl.signal,
      defaultDescription: DEFAULT_PREVIEW_DESC,
      defaultOgFallbackPath: OG_FALLBACK_IMAGE_PATH,
    });

    if (og) return og;

    return context.next();
  } catch {
    return context.next();
  } finally {
    clearTimeout(timeout);
  }
};

export const config: Config = {
  path: "/experiences/*",
};
