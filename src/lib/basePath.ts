// Static export served from https://jgemayel.github.io/shinobi-clash-tcg/
// Every absolute asset URL must be prefixed with the basePath, otherwise it
// resolves against the domain root and 404s. Keep this conditional in sync
// with next.config.ts.
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/shinobi-clash-tcg' : '';

export function asset(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  const p = path.startsWith('/') ? path : '/' + path;
  return BASE_PATH + p;
}
