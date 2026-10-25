import { isPreferentialScope } from '@/lib/config/virtualElection';

const DEFAULT_PRIVATE_CACHE_CONTROL = 'private, max-age=0, stale-while-revalidate=10';
const DEFAULT_PREFERENTIAL_CACHE_SECONDS = 10;

/**
 * Cache-Control for public result endpoints (/totals, /irv).
 *
 * Preferential scopes (Australia) compute IRV on every request, so their responses may be
 * shared by a CDN for a short time (VIRTUAL_ELECTION_TOTALS_CACHE_SECONDS, default 10 s,
 * 0 disables). Other scopes keep their existing private, always-revalidated behavior.
 * Clients bypass the shared cache right after voting by adding a cache-busting query param.
 */
export function getResultsCacheControl(scope) {
	if (!isPreferentialScope(scope)) return DEFAULT_PRIVATE_CACHE_CONTROL;

	const raw = process.env.VIRTUAL_ELECTION_TOTALS_CACHE_SECONDS;
	const seconds = raw === undefined || raw === '' ? DEFAULT_PREFERENTIAL_CACHE_SECONDS : Number(raw);
	if (!Number.isFinite(seconds) || seconds <= 0) return DEFAULT_PRIVATE_CACHE_CONTROL;

	const whole = Math.floor(seconds);
	return `public, s-maxage=${whole}, stale-while-revalidate=${whole * 3}`;
}
