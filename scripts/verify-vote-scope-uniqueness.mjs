import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const user = `scope-test-${Date.now()}`;

let differentCountryAllowed = false;
let sameScopeBlocked = false;

try {
	await sql`
		INSERT INTO virtual_election_votes (user_id, riding_id, party, country, district, year)
		VALUES (${user}, ${'10001'}, ${'LPC'}, ${'ca'}, ${'fed'}, ${2025})
	`;
	await sql`
		INSERT INTO virtual_election_votes (user_id, riding_id, party, country, district, year)
		VALUES (${user}, ${'us-fed-2025-01-1'}, ${'DEM'}, ${'us'}, ${'fed'}, ${2025})
	`;
	differentCountryAllowed = true;

	try {
		await sql`
			INSERT INTO virtual_election_votes (user_id, riding_id, party, country, district, year)
			VALUES (${user}, ${'10001'}, ${'CPC'}, ${'ca'}, ${'fed'}, ${2025})
		`;
	} catch {
		sameScopeBlocked = true;
	}
} finally {
	await sql`DELETE FROM virtual_election_votes WHERE user_id = ${user}`;
}

console.log(`different_country_allowed: ${differentCountryAllowed}`);
console.log(`same_scope_blocked: ${sameScopeBlocked}`);
