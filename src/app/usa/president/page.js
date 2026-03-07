import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';
import UsaPresidentView from '@/lib/components/virtualElection/president/UsaPresidentView';

const PRESIDENT_SCOPE = {
	country: 'us',
	district: 'pres',
	year: 2025
};

export const metadata = {
	title: 'USA Presidential Virtual Election',
	description:
		'Simulate the US presidential election with a live state map, electoral-vote projection, and virtual popular-vote totals.',
	alternates: {
		canonical: '/usa/president'
	},
	openGraph: {
		title: 'USA Presidential Virtual Election',
		description:
			'Simulate the US presidential election with a live state map, electoral-vote projection, and virtual popular-vote totals.',
		url: '/usa/president'
	}
};

export default async function UsaPresidentPage() {
	const pageData = await loadElectionPageData(PRESIDENT_SCOPE);
	return (
		<>
			<section
				aria-label="USA presidential election overview"
				style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem', color: '#4b5563' }}
			>
				<p style={{ margin: '0.5rem 0 0' }}>
					Explore a live US presidential virtual election map with state-by-state outcomes,
					electoral-vote projections, and dynamic vote totals.
				</p>
			</section>
			<UsaPresidentView {...pageData} />
		</>
	);
}
