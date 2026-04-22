/** Persist ?ref= user id for signup attribution (24-char ObjectId). */
const REF_KEY = "endebeto_ref";
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export function persistRefParam(ref: string | null | undefined): void {
  if (ref == null || ref === "") return;
  const t = String(ref).trim();
  if (!OBJECT_ID_RE.test(t)) return;
  try {
    localStorage.setItem(REF_KEY, t);
  } catch {
    /* ignore */
  }
}

export function getStoredRef(): string | undefined {
  try {
    const v = localStorage.getItem(REF_KEY);
    if (v && OBJECT_ID_RE.test(v)) return v;
  } catch {
    /* ignore */
  }
  return undefined;
}
