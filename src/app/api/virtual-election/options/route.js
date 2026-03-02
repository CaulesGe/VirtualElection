import { DEFAULT_SCOPE } from '@/lib/config/virtualElection';
import { getRidingsForScope } from '@/lib/server/virtualElection/ridings';
import {
	getElectionOptionsForScope,
	normalizeScope,
	VirtualElectionError
} from '@/lib/server/virtualElection/service';

function json(data, status = 200) {
	return Response.json(data, { status });
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

		const options = await getElectionOptionsForScope(scope);
		const ridings = await getRidingsForScope(scope);

		return json({
			scopeId: options.scopeId,
			scope: options.scope,
			countryCode: options.countryCode,
			mapVersion: options.mapVersion,
			districtIdNamespace: options.districtIdNamespace,
			allowedParties: options.allowedParties,
			ridings,
			rules: {
				oneVotePerUser: true,
				voteWindowLocked: false
			}
		});
	} catch (error) {
		if (error instanceof VirtualElectionError) {
			return json({ error: error.message, code: error.code }, 400);
		}
		console.error('[api/virtual-election/options] error', error);
		return json({ error: 'Failed to load election options' }, 500);
	}
}
