/** Chapa-hosted checkout only: https and checkout.chapa.co / *.chapa.co. */
export function isValidChapaCheckoutUrl(raw: unknown): raw is string {
  if (typeof raw !== "string" || !raw) return false;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return host === "checkout.chapa.co" || host.endsWith(".chapa.co");
  } catch {
    return false;
  }
}
