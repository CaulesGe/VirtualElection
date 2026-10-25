import { ELECTION_SITES } from '@/lib/config/electionCountries';

const siteUrl =
	process.env.NEXT_PUBLIC_SITE_URL ||
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export default function sitemap() {
	const now = new Date();
	return [
		{
			url: `${siteUrl}/`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 1
		},
		...ELECTION_SITES.map((site) => ({
			url: `${siteUrl}${site.route}`,
			lastModified: now,
			changeFrequency: 'daily',
			priority: 0.9
		}))
	];
}