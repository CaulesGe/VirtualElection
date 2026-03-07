import { canadaRegionProfile } from './canada';
import { ukRegionProfile } from './uk';
import { usaRegionProfile } from './usa';

const PROFILE_REGISTRY = {
	CA: canadaRegionProfile,
	UK: ukRegionProfile,
	US: usaRegionProfile
};

export function getRegionProfile(countryCode) {
	const normalized = String(countryCode ?? 'CA').toUpperCase();
	return PROFILE_REGISTRY[normalized] ?? canadaRegionProfile;
}
