import { DEFAULT_SCOPE } from '@/lib/config/virtualElection';
import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';

export const metadata = {
	title: 'Virtual Election 2026',
	description: "Participate in the virtual election and view live riding-level totals."
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
		<VirtualElectionPage
			session={session}
			scope={scope}
			initialTotals={initialTotals}
			initialMe={initialMe}
			initialRidings={initialRidings}
			mapMetadata={mapMetadata}
		/>
	);
}
