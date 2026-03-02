import { getServerAuthSession } from '@/lib/auth';
import { DEFAULT_SCOPE } from '@/lib/config/virtualElection';
import {
	assertCaptchaIfConfigured,
	assertRateLimit,
	assertTrustedOrigin,
	hashIp,
	VirtualElectionAbuseError
} from '@/lib/server/virtualElection/abuse';
import { getUserIdFromSession } from '@/lib/server/virtualElection/identity';
import {
	castOrUpdateVote,
	getUserVote,
	isMissingVirtualElectionTableError,
	normalizeScope,
	VirtualElectionError
} from '@/lib/server/virtualElection/service';

function json(data, status = 200) {
	return Response.json(data, { status });
}

function getClientAddress(request) {
	const forwarded = request.headers.get('x-forwarded-for');
	if (!forwarded) return '';
	return forwarded.split(',')[0]?.trim() ?? '';
}

export async function POST(request) {
	const session = await getServerAuthSession();
	const userId = getUserIdFromSession(session);
	if (!userId) return json({ error: 'Authentication required' }, 401);

	try {
		const allowedOrigins = (process.env.VIRTUAL_ELECTION_ALLOWED_ORIGINS ?? '')
			.split(',')
			.map((origin) => origin.trim())
			.filter(Boolean);
		assertTrustedOrigin({ request, allowedOrigins });

		const body = await request.json();
		const ridingId = String(body?.ridingId ?? '').trim();
		const party = String(body?.party ?? '').trim();
		const captchaToken = typeof body?.captchaToken === 'string' ? body.captchaToken : null;
		const clientIp = getClientAddress(request);
		const ipHash = hashIp(clientIp);

		await assertRateLimit(ipHash);
		await assertCaptchaIfConfigured({ captchaToken, clientIp });

		const scope = normalizeScope({
			country: String(body?.country ?? DEFAULT_SCOPE.country),
			district: String(body?.district ?? DEFAULT_SCOPE.district),
			year: Number(body?.year ?? DEFAULT_SCOPE.year)
		});
		if (!Number.isFinite(scope.year)) return json({ error: 'Invalid year' }, 400);

		const result = await castOrUpdateVote({ userId, ipHash, ridingId, party, ...scope });
		const me = await getUserVote(userId, scope);
		return json({ success: true, result, me });
	} catch (error) {
		if (error instanceof VirtualElectionAbuseError) {
			return json({ error: error.message, code: error.code }, error.status);
		}
		if (error instanceof VirtualElectionError) {
			if (error.code === 'VOTE_LOCKED' || error.code === 'CONFLICT') {
				return json({ error: error.message, code: error.code }, 409);
			}
			return json({ error: error.message, code: error.code }, 400);
		}
		if (isMissingVirtualElectionTableError(error)) {
			return json(
				{ error: 'Virtual election tables are not initialized yet. Run migrations and try again.' },
				503
			);
		}
		console.error('[api/virtual-election/vote] error', error);
		return json({ error: 'Failed to cast vote' }, 500);
	}
}
