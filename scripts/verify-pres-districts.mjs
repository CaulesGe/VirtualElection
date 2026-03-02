import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
	select
		e.scope_country,
		e.scope_district,
		e.scope_year,
		count(d.id)::int as districts
	from elections e
	left join election_districts d on d.election_id = e.id
	where e.scope_country = 'us'
	  and e.scope_district = 'pres'
	  and e.scope_year = 2025
	group by 1, 2, 3
`;
console.log(rows);
