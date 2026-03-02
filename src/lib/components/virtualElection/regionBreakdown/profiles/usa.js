import { getUsStateCodeFromFp } from '@/lib/virtualElection/usDistricts';

const US_STATES = [
	['AL', 'Alabama'],
	['AK', 'Alaska'],
	['AZ', 'Arizona'],
	['AR', 'Arkansas'],
	['CA', 'California'],
	['CO', 'Colorado'],
	['CT', 'Connecticut'],
	['DE', 'Delaware'],
	['DC', 'District of Columbia'],
	['FL', 'Florida'],
	['GA', 'Georgia'],
	['HI', 'Hawaii'],
	['ID', 'Idaho'],
	['IL', 'Illinois'],
	['IN', 'Indiana'],
	['IA', 'Iowa'],
	['KS', 'Kansas'],
	['KY', 'Kentucky'],
	['LA', 'Louisiana'],
	['ME', 'Maine'],
	['MD', 'Maryland'],
	['MA', 'Massachusetts'],
	['MI', 'Michigan'],
	['MN', 'Minnesota'],
	['MS', 'Mississippi'],
	['MO', 'Missouri'],
	['MT', 'Montana'],
	['NE', 'Nebraska'],
	['NV', 'Nevada'],
	['NH', 'New Hampshire'],
	['NJ', 'New Jersey'],
	['NM', 'New Mexico'],
	['NY', 'New York'],
	['NC', 'North Carolina'],
	['ND', 'North Dakota'],
	['OH', 'Ohio'],
	['OK', 'Oklahoma'],
	['OR', 'Oregon'],
	['PA', 'Pennsylvania'],
	['RI', 'Rhode Island'],
	['SC', 'South Carolina'],
	['SD', 'South Dakota'],
	['TN', 'Tennessee'],
	['TX', 'Texas'],
	['UT', 'Utah'],
	['VT', 'Vermont'],
	['VA', 'Virginia'],
	['WA', 'Washington'],
	['WV', 'West Virginia'],
	['WI', 'Wisconsin'],
	['WY', 'Wyoming']
];

const STATE_CODE_SET = new Set(US_STATES.map(([code]) => code));
const REGION_CODE_ALIASES = Object.fromEntries(
	US_STATES.map(([code, name]) => [name.toUpperCase().replace(/[^A-Z]/g, ''), code])
);

function toCanonicalRegionCode(value) {
	const normalized = String(value ?? '')
		.toUpperCase()
		.replace(/[^A-Z]/g, '');
	if (STATE_CODE_SET.has(normalized)) return normalized;
	return REGION_CODE_ALIASES[normalized] ?? normalized;
}

function inferStateCodeFromDistrictKey(ridingId) {
	const parts = String(ridingId ?? '').split('-');
	// us-fed-2025-01-1 or US-PRES-2025-06
	if (parts.length >= 5) return getUsStateCodeFromFp(parts[3]);
	if (parts.length >= 4) return getUsStateCodeFromFp(parts[3]);
	return '';
}

const REGION_OPTIONS = [
	{ value: 'Total', label: 'USA (Total)', codes: [] },
	...US_STATES.map(([code, label]) => ({ value: code, label, codes: [code, label] }))
];

export const usaRegionProfile = {
	getRegionOptions: () => REGION_OPTIONS,
	toCanonicalRegionCode,
	resolveRegionCode: ({ riding, row }) => {
		return riding?.subnational || inferStateCodeFromDistrictKey(row?.ridingId);
	}
};
