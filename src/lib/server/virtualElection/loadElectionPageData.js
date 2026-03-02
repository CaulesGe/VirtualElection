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

	// Run independent queries in parallel for faster server render
	const [initialTotals, initialMe, initialRidings, electionOptions] = await Promise.all([
		getTotals(scope).catch((error) =>
			isMissingVirtualElectionTableError(error) ? [] : Promise.reject(error)
		),
		userId
			? getUserVote(userId, scope).catch((error) =>
					isMissingVirtualElectionTableError(error) ? { voted: false } : Promise.reject(error)
				)
			: Promise.resolve({ voted: false }),
		getRidingsForScope(scope),
		getElectionOptionsForScope(scope).catch(() => null)
	]);

	let mapMetadata = getMapMetadataForScope(scope);
	if (electionOptions) {
		mapMetadata = {
			countryCode: electionOptions.countryCode,
			mapVersion: electionOptions.mapVersion,
			mode: electionOptions.mode,
			regionKey: electionOptions.regionKey,
			allocationRule: electionOptions.allocationRule,
			electoralVotesVersion: electionOptions.electoralVotesVersion
		};
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
