import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
	throw new Error('DATABASE_URL is not set');
}

const sql = neon(dbUrl);

await sql`BEGIN`;
try {
	await sql`TRUNCATE TABLE virtual_election_riding_totals`;
	await sql`
		INSERT INTO virtual_election_riding_totals (
			riding_id,
			party,
			country,
			district,
			year,
			votes,
			updated_at
		)
		SELECT
			riding_id,
			party,
			country,
			district,
			year,
			COUNT(*)::int AS votes,
			now() AS updated_at
		FROM virtual_election_votes
		GROUP BY riding_id, party, country, district, year
	`;
	await sql`COMMIT`;
} catch (error) {
	await sql`ROLLBACK`;
	throw error;
}

const [{ vote_count }] = await sql`SELECT COUNT(*)::int AS vote_count FROM virtual_election_votes`;
const [{ total_rows }] = await sql`SELECT COUNT(*)::int AS total_rows FROM virtual_election_riding_totals`;
const [{ total_votes }] = await sql`
	SELECT COALESCE(SUM(votes), 0)::int AS total_votes
	FROM virtual_election_riding_totals
`;

console.log(`Votes rows: ${vote_count}`);
console.log(`Totals rows: ${total_rows}`);
console.log(`Summed votes in totals: ${total_votes}`);
