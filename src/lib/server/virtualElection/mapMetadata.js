// Relative import (not "@/"): the seed script loads this module outside Next.js.
import { getElectionCountry, getElectionSite } from '../../config/electionCountries.js';

/**
 * Map metadata for a scope: the country's `map` config, overridden by the page's `map` config
 * (for example the USA presidential page uses a state map with electoral-vote allocation).
 */
export function getMapMetadataForScope(scope) {
	const countryCode = String(scope?.country ?? 'ca').toUpperCase();
	const year = String(scope?.year ?? '2025');
	const country = getElectionCountry(countryCode);
	if (!country) {
		return { countryCode, mapVersion: year, mode: 'house', regionKey: 'district' };
	}

	const site = getElectionSite({ country: country.code, district: scope?.district ?? 'fed' });
	const map = { ...country.map, ...(site?.map ?? {}) };
	return {
		countryCode,
		mapVersion: `${map.versionPrefix ?? ''}${year}`,
		mode: map.mode ?? 'house',
		regionKey: map.regionKey,
		...(map.allocationRule ? { allocationRule: map.allocationRule } : {}),
		...(map.electoralVotesVersion ? { electoralVotesVersion: map.electoralVotesVersion } : {}),
		...(country.votingSystem === 'preferential' ? { votingSystem: 'preferential' } : {})
	};
}
