import 'dotenv/config';
import fs from 'node:fs';
import { neon } from '@neondatabase/serverless';

const filePath = process.argv[2];
if (!filePath) {
	throw new Error('Usage: node scripts/import-virtual-election-votes.mjs <path-to-json>');
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
	throw new Error('DATABASE_URL is not set');
}

const raw = fs.readFileSync(filePath, 'utf8');
const votes = JSON.parse(raw);
const sql = neon(dbUrl);

let processed = 0;
for (const row of votes) {
	await sql`
		INSERT INTO virtual_election_votes (
			user_id, riding_id, party, country, district, year, created_at, updated_at, ip_hash
		)
		VALUES (
			${String(row.user_id)},
			${String(row.riding_id)},
			${String(row.party)},
			${String(row.country)},
			${String(row.district)},
			${Number(row.year)},
			${row.created_at},
			${row.updated_at},
			${row.ip_hash ?? null}
		)
		ON CONFLICT (user_id, country, district, year)
		DO UPDATE SET
			riding_id = EXCLUDED.riding_id,
			party = EXCLUDED.party,
			updated_at = EXCLUDED.updated_at,
			ip_hash = EXCLUDED.ip_hash
	`;
	processed += 1;
}

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM virtual_election_votes`;
console.log(`Imported/updated rows: ${processed}`);
console.log(`Total rows now: ${count}`);
