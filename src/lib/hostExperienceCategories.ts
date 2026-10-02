/** Experience themes hosts choose when applying and publishing; keep in sync across host and browse. */
export const HOST_EXPERIENCE_CATEGORY_OPTIONS = [
  "Cultural Tour",
  "Food & Cooking",
  "Adventure",
  "History & Heritage",
  "Nature & Wildlife",
  "Spiritual",
  "Arts & Crafts",
  "Music & Dance",
  "Coffee Ceremony",
  "Photography",
  "Language Exchange",
  "Wellness",
] as const;

/** Legacy category labels that may exist on older listings or host approvals. */
export const LEGACY_EXPERIENCE_CATEGORIES = [
  "Cultural Heritage",
  "Food & Cuisine",
  "History",
  "Art & Craft",
  "Religion & Spirituality",
] as const;

export type HostExperienceCategoryOption =
  (typeof HOST_EXPERIENCE_CATEGORY_OPTIONS)[number];

/** Puts the standard theme list first, then any extra/legacy themes found on live listings. */
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
