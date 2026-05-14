/** Experience themes hosts choose when publishing; keep in sync across host and browse. */
export const HOST_EXPERIENCE_CATEGORY_OPTIONS = [
  "Cultural Heritage",
  "Food & Cuisine",
  "Nature & Wildlife",
  "Adventure",
  "History",
  "Art & Craft",
  "Music & Dance",
  "Religion & Spirituality",
] as const;

export type HostExperienceCategoryOption = (typeof HOST_EXPERIENCE_CATEGORY_OPTIONS)[number];

/** Puts the standard theme list first, then any extra themes found on live listings. */
export function mergeHostAndCatalogCategories(
  fromApi: string[] | undefined,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of HOST_EXPERIENCE_CATEGORY_OPTIONS) {
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  if (!fromApi?.length) return out;
  const extras = fromApi
    .filter((c) => typeof c === "string" && c.trim() && !seen.has(c))
    .sort((a, b) => a.localeCompare(b));
  for (const c of extras) {
    seen.add(c);
    out.push(c);
  }
  return out;
}
