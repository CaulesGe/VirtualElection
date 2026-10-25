import { australiaRegionProfile } from './australia';
import { canadaRegionProfile } from './canada';
import { germanyRegionProfile } from './germany';
import { ukRegionProfile } from './uk';
import { usaRegionProfile } from './usa';

const PROFILE_REGISTRY = {
	AU: australiaRegionProfile,
	CA: canadaRegionProfile,
	DE: germanyRegionProfile,
	UK: ukRegionProfile,
	US: usaRegionProfile
};

export function getRegionProfile(countryCode) {
	const normalized = String(countryCode ?? 'CA').toUpperCase();
	return PROFILE_REGISTRY[normalized] ?? canadaRegionProfile;
}
