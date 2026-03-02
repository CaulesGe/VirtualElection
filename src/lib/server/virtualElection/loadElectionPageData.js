import { getServerAuthSession } from '@/lib/auth';
import { getMapMetadataForScope } from '@/lib/server/virtualElection/mapMetadata';
import { getUserIdFromSession } from '@/lib/server/virtualElection/identity';
import { getRidingsForScope } from '@/lib/server/virtualElection/ridings';
import {
	getElectionOptionsForScope,
	getTotals,
	getUserVote,
	isMissingVirtualElectionTableError
} from '@/lib/server/virtualElection/service';

export async function loadElectionPageData(scope) {
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
	let mapMetadata = getMapMetadataForScope(scope);
	try {
		const options = await getElectionOptionsForScope(scope);
		mapMetadata = {
			countryCode: options.countryCode,
			mapVersion: options.mapVersion,
			mode: options.mode,
			regionKey: options.regionKey,
			allocationRule: options.allocationRule,
			electoralVotesVersion: options.electoralVotesVersion
		};
	} catch {
		// Fall back to static scope metadata if DB options are unavailable.
	}

	return {
		session,
		scope,
		initialTotals,
		initialMe,
		initialRidings,
		mapMetadata
	};
}
