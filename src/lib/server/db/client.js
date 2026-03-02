import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const fallbackUrl = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
if (!process.env.DATABASE_URL) {
	console.warn('[db] DATABASE_URL is not set. Database calls will fail until configured.');
}
const sql = neon(process.env.DATABASE_URL || fallbackUrl);

export const db = drizzle(sql);
