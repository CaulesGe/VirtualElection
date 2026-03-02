import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const user = `scope-verify-us-${Date.now()}`;

let fedInsertWorked = false;
let presInsertWorked = false;
let duplicatePresBlocked = false;

try {
	await sql`
		INSERT INTO virtual_election_votes (user_id, riding_id, party, country, district, year)
		VALUES (${user}, ${'us-fed-2025-01-1'}, ${'DEM'}, ${'us'}, ${'fed'}, ${2025})
	`;
	fedInsertWorked = true;

	await sql`
		INSERT INTO virtual_election_votes (user_id, riding_id, party, country, district, year)
		VALUES (${user}, ${'US-PRES-2025-06'}, ${'REP'}, ${'us'}, ${'pres'}, ${2025})
	`;
	presInsertWorked = true;

	try {
		await sql`
			INSERT INTO virtual_election_votes (user_id, riding_id, party, country, district, year)
			VALUES (${user}, ${'US-PRES-2025-12'}, ${'IND'}, ${'us'}, ${'pres'}, ${2025})
		`;
	} catch {
		duplicatePresBlocked = true;
	}
} finally {
	await sql`DELETE FROM virtual_election_votes WHERE user_id = ${user}`;
}

console.log(`fed_insert_worked: ${fedInsertWorked}`);
console.log(`pres_insert_worked: ${presInsertWorked}`);
console.log(`duplicate_pres_blocked: ${duplicatePresBlocked}`);
