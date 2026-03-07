import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';

const UK_SCOPE = {
	country: 'uk',
	district: 'fed',
	year: 2025
};

export const metadata = {
	title: 'UK Parliament Virtual Election',
	description:
		'Explore the UK constituency map, cast a virtual vote, and follow live seat and vote distribution updates across England, Scotland, Wales, and Northern Ireland.',
	alternates: {
		canonical: '/uk'
	},
	openGraph: {
		title: 'UK Parliament Virtual Election',
		description:
			'Explore the UK constituency map, cast a virtual vote, and follow live seat and vote distribution updates across England, Scotland, Wales, and Northern Ireland.',
		url: '/uk'
	}
};

export default async function UkPage() {
	const { session, initialTotals, initialMe, initialRidings, mapMetadata } =
		await loadElectionPageData(UK_SCOPE);

	return (
		<>
			<section
				aria-label="UK election overview"
				style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem', color: '#4b5563' }}
			>
				<p style={{ margin: '0.5rem 0 0' }}>
					View UK parliament virtual election results by constituency, compare regional trends across
					the constituent countries, and interact with the live UK map.
				</p>
			</section>
			<VirtualElectionPage
				session={session}
				scope={UK_SCOPE}
				initialTotals={initialTotals}
				initialMe={initialMe}
				initialRidings={initialRidings}
				mapMetadata={mapMetadata}
			/>
		</>
	);
}
