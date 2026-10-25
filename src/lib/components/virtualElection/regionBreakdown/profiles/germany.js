import deDivisions from '@/lib/data/deDivisions.json';

// One option per state (Bundesland), built from the committed constituency list.
const STATE_OPTIONS = Array.from(
	new Map(deDivisions.map((division) => [division.state, division.stateName])).entries()
)
	.map(([code, label]) => ({
		value: code,
		label,
		codes: [code, String(label).toUpperCase().replace(/[^A-Z]/g, '')]
	}))
	.sort((a, b) => a.label.localeCompare(b.label));

const REGION_OPTIONS = [{ value: 'Total', label: 'Germany (Total)', codes: [] }, ...STATE_OPTIONS];

const REGION_CODE_ALIASES = Object.fromEntries(
	STATE_OPTIONS.flatMap((option) => option.codes.map((code) => [code, option.value]))
);

const STATE_BY_CONSTITUENCY_CODE = new Map(
	deDivisions.map((division) => [String(division.code), division.state])
);

function toCanonicalRegionCode(value) {
	const normalized = String(value ?? '')
		.toUpperCase()
		.replace(/[^A-Z]/g, '');
	return REGION_CODE_ALIASES[normalized] ?? normalized;
}

export const germanyRegionProfile = {
	getRegionOptions: () => REGION_OPTIONS,
	toCanonicalRegionCode,
	resolveRegionCode: ({ riding, row }) => {
		return (
			riding?.subnational ||
			STATE_BY_CONSTITUENCY_CODE.get(String(riding?.code ?? row?.ridingId ?? '')) ||
			''
		);
	}
};
