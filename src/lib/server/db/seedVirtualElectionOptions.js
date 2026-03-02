import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { feature } from 'topojson-client';
import statesTopology from 'us-atlas/states-10m.json' with { type: 'json' };
import {
	FEDERAL_PARTIES,
	VIRTUAL_ELECTION_ALLOWED_SCOPES,
	getAllowedPartiesForScope
} from '../../config/virtualElection.js';
import { getMapMetadataForScope } from '../virtualElection/mapMetadata.js';
import {
	US_STATE_FIPS_METADATA,
	normalizeStateFips,
	toUsPresidentDistrictKey
} from '../../virtualElection/usPresidentStates.js';
import { db } from './client.js';
import { electionDistricts, electionParties, elections, parties } from './schema.js';

async function ensureElection(scope) {
	const existing = await db
		.select({ id: elections.id })
		.from(elections)
		.where(
			and(
				eq(elections.scopeCountry, scope.country),
				eq(elections.scopeDistrict, scope.district),
				eq(elections.scopeYear, scope.year),
				eq(elections.status, 'active')
			)
		)
		.limit(1);
	if (existing[0]) return existing[0].id;

	const inserted = await db
		.insert(elections)
		.values({
			scopeCountry: scope.country,
			scopeDistrict: scope.district,
			scopeYear: scope.year,
			countryCode: getMapMetadataForScope(scope).countryCode,
			mapVersion: getMapMetadataForScope(scope).mapVersion,
			status: 'active'
		})
		.returning({ id: elections.id });
	return inserted[0].id;
}

function getUsPresidentDistrictRows(scope) {
	const states = feature(statesTopology, statesTopology.objects.states).features;
	return states
		.map((stateFeature) => {
			const fips = normalizeStateFips(stateFeature?.id);
			const meta = US_STATE_FIPS_METADATA[fips];
			if (!meta) return null;
			return {
				districtKey: toUsPresidentDistrictKey({ year: scope.year, fips }),
				name: meta.name,
				subnationalCode: meta.code,
				fips,
				electoralVotes: meta.electoralVotes
			};
		})
		.filter(Boolean)
		.sort((a, b) => a.fips.localeCompare(b.fips))
		.map((row, index) => ({
			...row,
			sortOrder: index
		}));
}

async function seed() {
	const partyEntries = Object.entries(FEDERAL_PARTIES).map(([id, meta]) => ({
		id,
		name: meta.name || id
	}));

	for (const party of partyEntries) {
		await db.insert(parties).values(party).onConflictDoNothing();
	}

	for (const scope of VIRTUAL_ELECTION_ALLOWED_SCOPES) {
		const electionId = await ensureElection(scope);
		const allowedPartyIds = getAllowedPartiesForScope(scope);
		for (const partyId of allowedPartyIds) {
			await db
				.insert(electionParties)
				.values({ electionId, partyId })
				.onConflictDoNothing();
		}

		if (scope.country === 'us' && scope.district === 'pres') {
			await db.delete(electionDistricts).where(eq(electionDistricts.electionId, electionId));
			const rows = getUsPresidentDistrictRows(scope).map((row) => ({
				electionId,
				districtKey: row.districtKey,
				name: row.name,
				subnationalCode: row.subnationalCode,
				fips: row.fips,
				electoralVotes: row.electoralVotes,
				sortOrder: row.sortOrder
			}));
			if (rows.length > 0) {
				await db.insert(electionDistricts).values(rows);
			}
		}
	}

	console.log('[seed] virtual election options seeded successfully');
}

seed()
	.catch((error) => {
		if (error?.cause?.code === '42P01' || error?.code === '42P01') {
			console.error('[seed] required tables are missing. Run `npm run db:migrate` first.');
		}
		console.error('[seed] failed to seed virtual election options', error);
		process.exit(1);
	});
