import auDivisions from '@/lib/data/auDivisions.json';

const REGION_OPTIONS = [
	{ value: 'Total', label: 'Australia (Total)', codes: [] },
	{ value: 'NSW', label: 'New South Wales', codes: ['NSW', 'NEWSOUTHWALES'] },
	{ value: 'VIC', label: 'Victoria', codes: ['VIC', 'VICTORIA'] },
	{ value: 'QLD', label: 'Queensland', codes: ['QLD', 'QUEENSLAND'] },
	{ value: 'WA', label: 'Western Australia', codes: ['WA', 'WESTERNAUSTRALIA'] },
	{ value: 'SA', label: 'South Australia', codes: ['SA', 'SOUTHAUSTRALIA'] },
	{ value: 'TAS', label: 'Tasmania', codes: ['TAS', 'TASMANIA'] },
	{ value: 'ACT', label: 'Australian Capital Territory', codes: ['ACT', 'AUSTRALIANCAPITALTERRITORY'] },
	{ value: 'NT', label: 'Northern Territory', codes: ['NT', 'NORTHERNTERRITORY'] }
];

const REGION_CODE_ALIASES = Object.fromEntries(
	REGION_OPTIONS.flatMap((option) => option.codes.map((code) => [code, option.value]))
);

const STATE_BY_DIVISION_CODE = new Map(
	auDivisions.map((division) => [String(division.code), division.state])
);

function toCanonicalRegionCode(value) {
	const normalized = String(value ?? '')
		.toUpperCase()
		.replace(/[^A-Z]/g, '');
	return REGION_CODE_ALIASES[normalized] ?? normalized;
}

export const australiaRegionProfile = {
	getRegionOptions: () => REGION_OPTIONS,
	toCanonicalRegionCode,
	resolveRegionCode: ({ riding, row }) => {
		return (
			riding?.subnational ||
			STATE_BY_DIVISION_CODE.get(String(riding?.code ?? row?.ridingId ?? '')) ||
			''
		);
	}
};
