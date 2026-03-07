import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
	throw new Error('DATABASE_URL is not set');
}

const sql = neon(dbUrl);

await sql`BEGIN`;
try {
	await sql`TRUNCATE TABLE "RidingResults".canada_riding_result, "RidingResults".usa_riding_result`;
	await sql`
		INSERT INTO "RidingResults".canada_riding_result (
			riding_id,
			party,
			district,
			year,
			votes,
			updated_at
		)
		SELECT
			riding_id,
			party,
			district,
			year,
			COUNT(*)::int AS votes,
			now() AS updated_at
		FROM virtual_election_votes
		WHERE lower(country) = 'ca'
		GROUP BY riding_id, party, country, district, year
	`;
	await sql`
		INSERT INTO "RidingResults".usa_riding_result (
			riding_id,
			party,
			district,
			year,
			votes,
			updated_at
		)
		SELECT
			riding_id,
			party,
			district,
			year,
			COUNT(*)::int AS votes,
			now() AS updated_at
		FROM virtual_election_votes
		WHERE lower(country) = 'us'
		GROUP BY riding_id, party, country, district, year
	`;
	await sql`COMMIT`;
} catch (error) {
	await sql`ROLLBACK`;
	throw error;
}

const [{ vote_count }] = await sql`SELECT COUNT(*)::int AS vote_count FROM virtual_election_votes`;
const [{ canada_total_rows }] = await sql`
	SELECT COUNT(*)::int AS canada_total_rows FROM "RidingResults".canada_riding_result
`;
const [{ usa_total_rows }] = await sql`
	SELECT COUNT(*)::int AS usa_total_rows FROM "RidingResults".usa_riding_result
`;
const [{ total_votes }] = await sql`
	SELECT (
		COALESCE((SELECT SUM(votes) FROM "RidingResults".canada_riding_result), 0) +
		COALESCE((SELECT SUM(votes) FROM "RidingResults".usa_riding_result), 0)
	)::int AS total_votes
`;

console.log(`Votes rows: ${vote_count}`);
console.log(`Canada totals rows: ${canada_total_rows}`);
console.log(`USA totals rows: ${usa_total_rows}`);
console.log(`Summed votes in totals: ${total_votes}`);
