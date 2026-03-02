import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { DEFAULT_SCOPE, FEDERAL_PARTIES } from '../../config/virtualElection.js';
import { db } from './client.js';
import { electionParties, elections, parties } from './schema.js';

async function ensureElection() {
	const existing = await db
		.select({ id: elections.id })
		.from(elections)
		.where(
			and(
				eq(elections.scopeCountry, DEFAULT_SCOPE.country),
				eq(elections.scopeDistrict, DEFAULT_SCOPE.district),
				eq(elections.scopeYear, DEFAULT_SCOPE.year),
				eq(elections.status, 'active')
			)
		)
		.limit(1);
	if (existing[0]) return existing[0].id;

	const inserted = await db
		.insert(elections)
		.values({
			scopeCountry: DEFAULT_SCOPE.country,
			scopeDistrict: DEFAULT_SCOPE.district,
			scopeYear: DEFAULT_SCOPE.year,
			countryCode: DEFAULT_SCOPE.country.toUpperCase(),
			mapVersion: String(DEFAULT_SCOPE.year),
			status: 'active'
		})
		.returning({ id: elections.id });
	return inserted[0].id;
}

async function seed() {
	const partyEntries = Object.entries(FEDERAL_PARTIES).map(([id, meta]) => ({
		id,
		name: meta.name || id
	}));

	for (const party of partyEntries) {
		await db.insert(parties).values(party).onConflictDoNothing();
	}

	const electionId = await ensureElection();

	for (const party of partyEntries) {
		await db
			.insert(electionParties)
			.values({ electionId, partyId: party.id })
			.onConflictDoNothing();
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
