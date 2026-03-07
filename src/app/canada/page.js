import { DEFAULT_SCOPE } from '@/lib/config/virtualElection';
import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';

export const metadata = {
	title: 'Canada Federal Virtual Election',
	description:
		'Explore the Canada federal election map, vote by riding, and track live virtual totals and regional seat/vote breakdowns.',
	alternates: {
		canonical: '/canada'
	},
	openGraph: {
		title: 'Canada Federal Virtual Election',
		description:
			'Explore the Canada federal election map, vote by riding, and track live virtual totals and regional seat/vote breakdowns.',
		url: '/canada'
	}
};

export default async function Page() {
	const scope = DEFAULT_SCOPE;
	const {
		session,
		initialTotals,
		initialMe,
		initialRidings,
		mapMetadata
	} = await loadElectionPageData(scope);

	return (
		<>
			<section
				aria-label="Canada election overview"
				style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem', color: '#4b5563' }}
			>
				<p style={{ margin: '0.5rem 0 0' }}>
					Track Canada federal virtual election totals by riding, compare regional seat and vote
					distributions, and interact with the live map view.
				</p>
			</section>
			<VirtualElectionPage
				session={session}
				scope={scope}
				initialTotals={initialTotals}
				initialMe={initialMe}
				initialRidings={initialRidings}
				mapMetadata={mapMetadata}
			/>
		</>
	);
}
