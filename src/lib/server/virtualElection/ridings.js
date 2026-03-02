import { and, eq, sql } from 'drizzle-orm';
import { DEFAULT_RIDINGS } from '@/lib/data/defaultRidings';
import { db } from '@/lib/server/db/client';
import { constituencies, countries, jurisdictions } from '@/lib/server/db/schema';

export async function getRidingsForScope(scope) {
	try {
		const rows = await db
			.select({
				code: constituencies.code,
				name: constituencies.name,
				subnational: constituencies.subnational
			})
			.from(constituencies)
			.innerJoin(jurisdictions, eq(jurisdictions.id, constituencies.jurisdictionId))
			.innerJoin(countries, eq(countries.id, jurisdictions.countryId))
			.where(
				and(
					sql`lower(${countries.code}) = ${scope.country}`,
					sql`lower(${jurisdictions.code}) = ${scope.district}`
				)
			);

		if (!rows?.length) return DEFAULT_RIDINGS;
		return rows.map((row) => ({
			code: String(row.code),
			name: row.name || String(row.code),
			subnational: row.subnational || ''
		}));
	} catch {
		return DEFAULT_RIDINGS;
	}
}
