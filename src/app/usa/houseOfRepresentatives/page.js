import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';

const HOUSE_SCOPE = {
	country: 'us',
	district: 'fed',
	year: 2025
};

export const metadata = {
	title: 'USA House Virtual Election',
	description:
		'Explore the US House district map, cast virtual votes, and monitor live district-level seat and vote totals.',
	alternates: {
		canonical: '/usa/houseOfRepresentatives'
	},
	openGraph: {
		title: 'USA House Virtual Election',
		description:
			'Explore the US House district map, cast virtual votes, and monitor live district-level seat and vote totals.',
		url: '/usa/houseOfRepresentatives'
	}
};

export default async function UsaHousePage() {
	const pageData = await loadElectionPageData(HOUSE_SCOPE);
	return (
		<>
			<section
				aria-label="USA House election overview"
				style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem', color: '#4b5563' }}
			>
				<p style={{ margin: '0.5rem 0 0' }}>
					Track US House virtual election outcomes by district with a live map, riding-level totals,
					and regional breakdowns.
				</p>
			</section>
			<VirtualElectionPage {...pageData} />
		</>
	);
}
