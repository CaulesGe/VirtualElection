import { and, eq, sql } from 'drizzle-orm';
import { DEFAULT_RIDINGS } from '@/lib/data/defaultRidings';
import { getDivisions } from '@/lib/config/electionCountries';
import { db } from '@/lib/server/db/client';
import {
	constituencies,
	countries,
	electionDistricts,
	elections,
	jurisdictions
} from '@/lib/server/db/schema';
import { getTopoDistricts } from '@/lib/server/virtualElection/mapAssets';
import { getUsRidingsForScope } from '@/lib/server/virtualElection/usRidings';

function dedupeRidingsByCode(rows) {
	const byCode = new Map();
	for (const row of rows ?? []) {
		const code = String(row?.code ?? '').trim();
		if (!code) continue;
		if (!byCode.has(code)) {
			byCode.set(code, {
				code,
				name: row?.name ? String(row.name) : code,
				subnational: row?.subnational ? String(row.subnational) : '',
				electoralVotes: row?.electoralVotes ?? null
			});
		}
	}
	return Array.from(byCode.values());
}

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
			return dedupeRidingsByCode(
				scopedDistricts.map((row) => ({
				code: String(row.code),
				name: row.name || String(row.code),
				subnational: row.subnational || '',
				electoralVotes: row.electoralVotes ?? null
			}))
			);
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

	if (String(scope?.district).toLowerCase() === 'fed') {
		// PMTiles countries: districts come from the committed division list that mirrors the
		// tiles (see scripts/extract-*-divisions.mjs --check); there is no legacy DB fallback.
		const divisions = getDivisions(scope?.country);
		if (divisions) {
			return dedupeRidingsByCode(
				divisions.map((division) => ({
					code: division.code,
					name: division.name,
					subnational: division.state
				}))
			);
		}

		// TopoJSON countries: districts are read from the map asset, falling back to the legacy source.
		try {
			const mapRidings = await getTopoDistricts(scope?.country);
			if (mapRidings?.length > 0) return dedupeRidingsByCode(mapRidings);
		} catch {
			// Continue into legacy source fallback.
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
		return dedupeRidingsByCode(
			rows.map((row) => ({
			code: String(row.code),
			name: row.name || String(row.code),
			subnational: row.subnational || ''
		}))
		);
	} catch {
		return DEFAULT_RIDINGS;
	}
}
