export function getMapMetadataForScope(scope) {
	const countryCode = String(scope?.country ?? 'ca').toUpperCase();
	const district = String(scope?.district ?? 'fed').toLowerCase();
	const year = String(scope?.year ?? '2025');

	if (countryCode === 'US' && district === 'pres') {
		return {
			countryCode: 'US',
			mapVersion: `pres-${year}`,
			mode: 'president',
			regionKey: 'state',
			allocationRule: 'winner_take_all',
			electoralVotesVersion: '2020_apportionment'
		};
	}

	if (countryCode === 'US') {
		return {
			countryCode: 'US',
			mapVersion: `house-${year}`,
			mode: 'house',
			regionKey: 'district'
		};
	}

	if (countryCode === 'UK') {
		return {
			countryCode: 'UK',
			mapVersion: `uk-${year}`,
			mode: 'house',
			regionKey: 'constituency'
		};
	}

	return {
		countryCode,
		mapVersion: year,
		mode: 'house',
		regionKey: 'district'
	};
}
