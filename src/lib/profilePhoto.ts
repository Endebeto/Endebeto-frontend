/** True when `photo` is a URL the browser can load (OAuth avatars, Cloudinary, etc.). */
export function isDisplayableProfilePhotoUrl(raw: string | undefined | null): boolean {
  if (raw == null || typeof raw !== "string") return false;
  const s = raw.trim();
  if (!s) return false;
  const lower = s.toLowerCase();
  if (lower.startsWith("https://") || lower.startsWith("http://")) return true;
  if (lower.startsWith("//")) return true;
  if (lower.startsWith("data:image/")) return true;
  if (lower.startsWith("blob:")) return true;
  return false;
}

export function getUserInitials(name: string | undefined | null): string {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}
