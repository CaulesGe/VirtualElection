import { normalizeStateFips, US_STATE_FIPS_METADATA } from '@/lib/virtualElection/usPresidentStates';

export function normalizeUsDistrictCode(value) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) return 'AL';
	return String(Math.trunc(parsed));
}

export function getUsStateCodeFromFp(stateFp) {
	return US_STATE_FIPS_METADATA[normalizeStateFips(stateFp)]?.code ?? '';
}

export function toUsDistrictKey({ stateFp, district, year = 2025 }) {
	const normalizedStateFp = normalizeStateFips(stateFp);
	const districtCode = normalizeUsDistrictCode(district);
	if (!normalizedStateFp) return '';
	return `us-fed-${Number(year)}-${normalizedStateFp}-${districtCode}`;
}

export function toUsDistrictLabel({ stateFp, district }) {
	const stateCode = getUsStateCodeFromFp(stateFp);
	const districtCode = normalizeUsDistrictCode(district);
	if (!stateCode) return districtCode === 'AL' ? 'At-Large' : `District ${districtCode}`;
	return `${stateCode}-${districtCode}`;
}
