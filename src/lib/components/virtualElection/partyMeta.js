import { FEDERAL_PARTIES } from '@/lib/config/virtualElection';

export const PARTY_META = {
	...Object.fromEntries(
		Object.entries(FEDERAL_PARTIES).map(([code, party]) => [
			code,
			{
				name: party.shortName || party.name || code,
				color: party.color
			}
		])
	),
	NoVotes: { name: 'No Votes Yet', color: '#d1d5db' }
};

export function getPartyShortName(code) {
	return PARTY_META[code]?.name ?? code;
}

export function getPartyColor(code) {
	return PARTY_META[code]?.color ?? '#6b7280';
}
