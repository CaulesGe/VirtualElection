import { getServerAuthSession } from '@/lib/auth';
import { DEFAULT_SCOPE } from '@/lib/config/virtualElection';
import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { getRidingsForScope } from '@/lib/server/virtualElection/ridings';
import {
	getTotals,
	getUserVote,
	isMissingVirtualElectionTableError
} from '@/lib/server/virtualElection/service';
import { getUserIdFromSession } from '@/lib/server/virtualElection/identity';
import { getMapMetadataForScope } from '@/lib/server/virtualElection/mapMetadata';

export const metadata = {
	title: 'Virtual Election 2026',
	description: "Participate in the virtual election and view live riding-level totals."
};

export default async function Page() {
	const scope = DEFAULT_SCOPE;
	const session = await getServerAuthSession();
	const userId = getUserIdFromSession(session);

	let initialTotals = [];
	try {
		initialTotals = await getTotals(scope);
	} catch (error) {
		if (!isMissingVirtualElectionTableError(error)) throw error;
	}

	let initialMe = { voted: false };
	if (userId) {
		try {
			initialMe = await getUserVote(userId, scope);
		} catch (error) {
			if (!isMissingVirtualElectionTableError(error)) throw error;
		}
	}

	const initialRidings = await getRidingsForScope(scope);
	const mapMetadata = getMapMetadataForScope(scope);

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
