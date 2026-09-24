/**
 * Single source of truth for the API base URL.
 *
 * Default: Vercel production backend.
 * Optional LOCAL_API_HOST override for LAN / tunnel testing only.
 */

/** Production API host (no trailing /api). */
const VERCEL_API_HOST = 'https://backend-xi-hazel-jl046ni6j3.vercel.app';

/**
 * Optional override (LAN IP or Cloudflare tunnel). Leave empty to use Vercel.
 * Example: 'http://192.168.18.72:4000'
 */
const LOCAL_API_HOST = '';

export const API_BASE_URL: string = `${LOCAL_API_HOST || VERCEL_API_HOST}/api`;

export default API_BASE_URL;
