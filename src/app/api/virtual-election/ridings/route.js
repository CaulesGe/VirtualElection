import { DEFAULT_SCOPE } from '@/lib/config/virtualElection';
import { getRidingsForScope } from '@/lib/server/virtualElection/ridings';
import { normalizeScope } from '@/lib/server/virtualElection/service';

export async function GET(request) {
	const url = new URL(request.url);
	const scope = normalizeScope({
		country: url.searchParams.get('country') ?? DEFAULT_SCOPE.country,
		district: url.searchParams.get('district') ?? DEFAULT_SCOPE.district,
		year: Number(url.searchParams.get('year') ?? DEFAULT_SCOPE.year)
	});

	const ridings = await getRidingsForScope(scope);
	return Response.json({ ridings });
}
