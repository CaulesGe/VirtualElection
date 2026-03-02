import { and, eq, sql } from 'drizzle-orm';
import { DEFAULT_RIDINGS } from '@/lib/data/defaultRidings';
import { db } from '@/lib/server/db/client';
import {
	constituencies,
	countries,
	electionDistricts,
	elections,
	jurisdictions
} from '@/lib/server/db/schema';
import { getUsRidingsForScope } from '@/lib/server/virtualElection/usRidings';

export async function getRidingsForScope(scope) {
	try {
		const scopedDistricts = await db
			.select({
				code: electionDistricts.districtKey,
				name: electionDistricts.name,
				subnational: electionDistricts.subnationalCode,
				electoralVotes: electionDistricts.electoralVotes
			})
			.from(electionDistricts)
			.innerJoin(elections, eq(elections.id, electionDistricts.electionId))
			.where(
				and(
					eq(elections.scopeCountry, scope.country),
					eq(elections.scopeDistrict, scope.district),
					eq(elections.scopeYear, scope.year),
					eq(elections.status, 'active')
				)
			);
		if (scopedDistricts.length > 0) {
			return scopedDistricts.map((row) => ({
				code: String(row.code),
				name: row.name || String(row.code),
				subnational: row.subnational || '',
				electoralVotes: row.electoralVotes ?? null
			}));
		}
	} catch {
		// Continue into legacy source fallback.
	}

	if (String(scope?.country).toLowerCase() === 'us') {
		if (String(scope?.district).toLowerCase() === 'pres') {
			return [];
		}
		try {
			return await getUsRidingsForScope(scope);
		} catch {
			return [];
		}
	}

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
