// ponytail: pure + node-safe so scripts/check-auth.mjs can pin it.
/** Resolve a post-login redirect target; never leave the current origin. */
export function safeNext(next: string | null, origin: string): string {
  if (!next) return "/dashboard";
  try {
    const url = new URL(next, origin);
    return url.origin === origin ? url.pathname + url.search : "/dashboard";
  } catch {
    return "/dashboard";
  }
}