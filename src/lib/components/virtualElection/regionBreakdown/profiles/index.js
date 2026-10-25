import { ELECTION_COUNTRIES } from '@/lib/config/electionCountries';
import { createConfiguredRegionProfile } from './createRegionProfile';
import { usaRegionProfile } from './usa';

// Countries whose `regions.source` is 'custom' provide their own profile.
const CUSTOM_PROFILES = {
	US: usaRegionProfile
};

const PROFILE_REGISTRY = Object.fromEntries(
	ELECTION_COUNTRIES.map((country) => {
		const countryCode = country.code.toUpperCase();
		const profile =
			country.regions?.source === 'custom'
				? CUSTOM_PROFILES[countryCode]
				: createConfiguredRegionProfile(country);
		return [countryCode, profile];
	})
);
const defaultProfile = PROFILE_REGISTRY[ELECTION_COUNTRIES[0].code.toUpperCase()];

export function getRegionProfile(countryCode) {
	const normalized = String(countryCode ?? '').toUpperCase();
	return PROFILE_REGISTRY[normalized] ?? defaultProfile;
}
