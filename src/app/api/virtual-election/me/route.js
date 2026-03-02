import { getServerAuthSession } from '@/lib/auth';
import { DEFAULT_SCOPE } from '@/lib/config/virtualElection';
import { getUserIdFromSession } from '@/lib/server/virtualElection/identity';
import {
	getUserVote,
	isMissingVirtualElectionTableError,
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

		const session = await getServerAuthSession();
		const userId = getUserIdFromSession(session);
		if (!userId) return json({ voted: false });

		const vote = await getUserVote(userId, scope);
		return json(vote);
	} catch (error) {
		if (error instanceof VirtualElectionError) {
			return json({ error: error.message, code: error.code }, 400);
		}
		if (isMissingVirtualElectionTableError(error)) return json({ voted: false });
		console.error('[api/virtual-election/me] error', error);
		return json({ error: 'Failed to load user vote' }, 500);
	}
}
