import { createHash } from 'node:crypto';
import { DEFAULT_SCOPE } from '@/lib/config/virtualElection';
import {
	getTotals,
	isMissingVirtualElectionTableError,
	normalizeScope,
	VirtualElectionError
} from '@/lib/server/virtualElection/service';

function json(data, status = 200, extraHeaders = {}) {
	return Response.json(data, { status, headers: extraHeaders });
}

function computeETag(body) {
	const raw = JSON.stringify(body);
	return `"${createHash('md5').update(raw).digest('hex')}"`;
}

export async function GET(request) {
	try {
		const url = new URL(request.url);
		const scope = normalizeScope({
			country: url.searchParams.get('country') ?? DEFAULT_SCOPE.country,
			district: url.searchParams.get('district') ?? DEFAULT_SCOPE.district,
			year: Number(url.searchParams.get('year') ?? DEFAULT_SCOPE.year)
		});
		if (!Number.isFinite(scope.year)) return json({ error: 'Invalid year' }, 400);
		const ridings = await getTotals(scope);
		const body = { ridings };

		const etag = computeETag(body);
		const clientETag = request.headers.get('if-none-match');
		if (clientETag && clientETag === etag) {
			return new Response(null, {
				status: 304,
				headers: { ETag: etag }
			});
		}

		return json(body, 200, {
			ETag: etag,
			'Cache-Control': 'private, max-age=0, stale-while-revalidate=10'
		});
	} catch (error) {
		if (error instanceof VirtualElectionError) {
			return json({ error: error.message, code: error.code }, 400);
		}
		if (isMissingVirtualElectionTableError(error)) return json({ ridings: [] });
		console.error('[api/virtual-election/totals] error', error);
		return json({ error: 'Failed to load totals' }, 500);
	}
}
