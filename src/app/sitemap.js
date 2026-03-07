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
		{
			url: `${siteUrl}/canada`,
			lastModified: now,
			changeFrequency: 'daily',
			priority: 0.9
		},
		{
			url: `${siteUrl}/usa/president`,
			lastModified: now,
			changeFrequency: 'daily',
			priority: 0.9
		},
		{
			url: `${siteUrl}/usa/houseOfRepresentatives`,
			lastModified: now,
			changeFrequency: 'daily',
			priority: 0.9
		},
		{
			url: `${siteUrl}/uk`,
			lastModified: now,
			changeFrequency: 'daily',
			priority: 0.9
		}
	];
}
