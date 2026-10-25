import { DEFAULT_SCOPE } from '@/lib/config/virtualElection';
import { getResultsCacheControl } from '@/lib/server/virtualElection/cache';
import {
	getIrvForRiding,
	isMissingVirtualElectionTableError,
	normalizeScope,
	VirtualElectionError
} from '@/lib/server/virtualElection/service';

function json(data, status = 200, extraHeaders = {}) {
	return Response.json(data, { status, headers: extraHeaders });
}

// Full round-by-round IRV result for a single division (ranked-ballot scopes only).
export async function GET(request) {
	try {
		const url = new URL(request.url);
		const scope = normalizeScope({
			country: url.searchParams.get('country') ?? DEFAULT_SCOPE.country,
			district: url.searchParams.get('district') ?? DEFAULT_SCOPE.district,
			year: Number(url.searchParams.get('year') ?? DEFAULT_SCOPE.year)
		});
		if (!Number.isFinite(scope.year)) return json({ error: 'Invalid year' }, 400);

		const ridingId = String(url.searchParams.get('ridingId') ?? '').trim();
		if (!ridingId) return json({ error: 'ridingId is required', code: 'INVALID_RIDING' }, 400);

		const result = await getIrvForRiding(scope, ridingId);
		return json(result, 200, { 'Cache-Control': getResultsCacheControl(scope) });
	} catch (error) {
		if (error instanceof VirtualElectionError) {
			return json({ error: error.message, code: error.code }, 400);
		}
		if (isMissingVirtualElectionTableError(error)) {
			return json(
				{ error: 'Virtual election tables are not initialized yet. Run migrations and try again.' },
				503
			);
		}
		console.error('[api/virtual-election/irv] error', error);
		return json({ error: 'Failed to load IRV result' }, 500);
	}
}
