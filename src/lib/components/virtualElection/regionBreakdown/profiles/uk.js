const REGION_OPTIONS = [
	{ value: 'Total', label: 'United Kingdom (Total)', codes: [] },
	{ value: 'E', label: 'England', codes: ['E', 'ENGLAND'] },
	{ value: 'S', label: 'Scotland', codes: ['S', 'SCOTLAND'] },
	{ value: 'W', label: 'Wales', codes: ['W', 'WALES'] },
	{ value: 'N', label: 'Northern Ireland', codes: ['N', 'NORTHERNIRELAND'] }
];

const REGION_CODE_ALIASES = {
	E: 'E',
	ENGLAND: 'E',
	S: 'S',
	SCOTLAND: 'S',
	W: 'W',
	WALES: 'W',
	N: 'N',
	NORTHERNIRELAND: 'N'
};

function toCanonicalRegionCode(value) {
	const normalized = String(value ?? '')
		.toUpperCase()
		.replace(/[^A-Z]/g, '');
	return REGION_CODE_ALIASES[normalized] ?? normalized;
}

function inferRegionCodeFromConstituencyCode(codeLike) {
	const code = String(codeLike ?? '').trim().toUpperCase();
	if (!code) return '';
	const prefix = code[0];
	return ['E', 'S', 'W', 'N'].includes(prefix) ? prefix : '';
}

export const ukRegionProfile = {
	getRegionOptions: () => REGION_OPTIONS,
	toCanonicalRegionCode,
	resolveRegionCode: ({ riding, row }) => {
		return inferRegionCodeFromConstituencyCode(riding?.code ?? row?.ridingId);
	}
};
