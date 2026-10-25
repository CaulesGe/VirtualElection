import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';

const GERMANY_SCOPE = {
	country: 'de',
	district: 'fed',
	year: 2025
};

const DESCRIPTION =
	'Explore the 299 German Bundestag constituencies, cast a virtual constituency vote (Erststimme), and follow live seat and vote distribution updates across all 16 states.';

export const metadata = {
	title: 'Germany Bundestag Virtual Election',
	description: DESCRIPTION,
	alternates: {
		canonical: '/germany'
	},
	openGraph: {
		title: 'Germany Bundestag Virtual Election',
		description: DESCRIPTION,
		url: '/germany'
	}
};

export default async function GermanyPage() {
	const { session, initialTotals, initialMe, initialRidings, mapMetadata } =
		await loadElectionPageData(GERMANY_SCOPE);

	return (
		<>
			<section
				aria-label="Germany election overview"
				style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem', color: '#4b5563' }}
			>
				<p style={{ margin: '0.5rem 0 0' }}>
					Vote for the party you want to win your constituency. This simulates the first vote
					(Erststimme): the party with the most votes in each of the 299 constituencies wins that
					seat. The second vote and list seats are not part of this simulation. CDU and CSU are
					shown together.
				</p>
			</section>
			<VirtualElectionPage
				session={session}
				scope={GERMANY_SCOPE}
				initialTotals={initialTotals}
				initialMe={initialMe}
				initialRidings={initialRidings}
				mapMetadata={mapMetadata}
			/>
		</>
	);
}
