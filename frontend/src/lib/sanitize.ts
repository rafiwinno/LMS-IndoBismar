// URL sanitization — cegah serangan javascript: URL (XSS melalui href)
const SAFE_PROTOCOLS = ['http:', 'https:'];

/**
 * Pastikan URL aman untuk digunakan sebagai href.
 * Menolak protocol javascript:, data:, vbscript:, dll.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  // URL relatif (path dimulai dengan /) aman
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.includes(parsed.protocol) ? url : '#';
  } catch {
    return '#';
  }
}

/**
 * Pastikan URL hanya menggunakan protocol yang diizinkan.
 * Digunakan sebelum membuka file/dokumen dari server.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  return sanitizeUrl(url) !== '#';
}
