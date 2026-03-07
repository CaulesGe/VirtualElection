import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';

const UK_SCOPE = {
	country: 'uk',
	district: 'fed',
	year: 2025
};

export const metadata = {
	title: 'Virtual Election UK 2025',
	description: 'Participate in the UK virtual election and view live constituency-level totals.'
};

export default async function UkPage() {
	const { session, initialTotals, initialMe, initialRidings, mapMetadata } =
		await loadElectionPageData(UK_SCOPE);

	return (
		<VirtualElectionPage
			session={session}
			scope={UK_SCOPE}
			initialTotals={initialTotals}
			initialMe={initialMe}
			initialRidings={initialRidings}
			mapMetadata={mapMetadata}
		/>
	);
}
