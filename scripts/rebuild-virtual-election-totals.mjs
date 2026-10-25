import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
	throw new Error('DATABASE_URL is not set');
}

const sql = neon(dbUrl);

// Rebuilds the aggregate tables from the canonical vote rows (virtual_election_votes), for every
// country at once.
await sql`BEGIN`;
try {
	await sql`TRUNCATE TABLE "RidingResults".riding_result, "RidingResults".ballot_result`;
	await sql`
		INSERT INTO "RidingResults".riding_result (
			country,
			riding_id,
			party,
			district,
			year,
			votes,
			updated_at
		)
		SELECT
			lower(country),
			riding_id,
			party,
			district,
			year,
			COUNT(*)::int AS votes,
			now() AS updated_at
		FROM virtual_election_votes
		GROUP BY lower(country), riding_id, party, district, year
	`;
	// Ranked ballots (preferential scopes) used for IRV counting.
	await sql`
		INSERT INTO "RidingResults".ballot_result (
			country,
			riding_id,
			ranking_key,
			district,
			year,
			votes,
			updated_at
		)
		SELECT
			lower(country),
			riding_id,
			ranking_key,
			district,
			year,
			COUNT(*)::int AS votes,
			now() AS updated_at
		FROM virtual_election_votes
		WHERE ranking_key IS NOT NULL
		GROUP BY lower(country), riding_id, ranking_key, district, year
	`;
	await sql`COMMIT`;
} catch (error) {
	await sql`ROLLBACK`;
	throw error;
}

const [{ vote_count }] = await sql`SELECT COUNT(*)::int AS vote_count FROM virtual_election_votes`;
console.log(`Votes rows: ${vote_count}`);

const perCountry = await sql`
	SELECT country, COUNT(*)::int AS row_count, COALESCE(SUM(votes), 0)::int AS vote_sum
	FROM "RidingResults".riding_result
	GROUP BY country
	ORDER BY country
`;
for (const row of perCountry) {
	console.log(`${row.country}: ${row.row_count} totals rows, ${row.vote_sum} votes`);
}

const [{ ballot_rows }] = await sql`
	SELECT COUNT(*)::int AS ballot_rows FROM "RidingResults".ballot_result
`;
console.log(`Ranked-ballot rows: ${ballot_rows}`);
console.log(
	`Summed votes in totals: ${perCountry.reduce((sum, row) => sum + Number(row.vote_sum), 0)}`
);
