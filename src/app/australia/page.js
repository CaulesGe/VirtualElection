import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';

const AUSTRALIA_SCOPE = {
	country: 'au',
	district: 'fed',
	year: 2025
};

export const metadata = {
	title: 'Australia House of Representatives Virtual Election',
	description:
		'Explore the 150 Australian federal divisions, rank every party on a preferential ballot, and follow live seat and first-preference results with instant-runoff preference counts.',
	alternates: {
		canonical: '/australia'
	},
	openGraph: {
		title: 'Australia House of Representatives Virtual Election',
		description:
			'Explore the 150 Australian federal divisions, rank every party on a preferential ballot, and follow live seat and first-preference results with instant-runoff preference counts.',
		url: '/australia'
	}
};

export default async function AustraliaPage() {
	const { session, initialTotals, initialMe, initialRidings, mapMetadata } =
		await loadElectionPageData(AUSTRALIA_SCOPE);

	return (
		<>
			<section
				aria-label="Australia election overview"
				style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem', color: '#4b5563' }}
			>
				<p style={{ margin: '0.5rem 0 0' }}>
					Rank every party in order of preference. Each division is counted with preferential
					(instant-runoff) voting: the party with the fewest votes is eliminated and its ballots
					move to each voter&apos;s next preference until one party has a majority.
				</p>
			</section>
			<VirtualElectionPage
				session={session}
				scope={AUSTRALIA_SCOPE}
				initialTotals={initialTotals}
				initialMe={initialMe}
				initialRidings={initialRidings}
				mapMetadata={mapMetadata}
			/>
		</>
	);
}
