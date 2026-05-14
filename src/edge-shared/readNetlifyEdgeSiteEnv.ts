/**
 * Read site env vars from Netlify Edge runtimes without referencing `Netlify` or `Deno` as
 * global identifiers (so Node/VSCode TypeScript stay clean). Prefer `globalThis.Netlify.env`
 * (current primitives); fall back to `globalThis.Deno.env` when present.
 */
export function readSiteEnvForEdgeFn(key: string): string | undefined {
  try {
    const nw = (
      globalThis as unknown as {
        Netlify?: { env?: { get(name: string): string } };
      }
    ).Netlify;
    if (nw?.env) {
      const v = nw.env.get(key);
      if (typeof v === "string" && v.trim() !== "") return v.trim();
    }
  } catch {
    /* newer/older primitives differ across deploys */
  }

  try {
    const dn = (
      globalThis as unknown as {
        Deno?: { env?: { get(name: string): string | undefined } };
      }
    ).Deno;
    const v = dn?.env?.get(key);
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  } catch {
    /* ignore */
  }

  return undefined;
}
