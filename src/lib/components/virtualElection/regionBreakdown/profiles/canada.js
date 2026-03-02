const REGION_OPTIONS = [
	{ value: 'Total', label: 'Canada (Total)', codes: [] },
	{ value: 'NL', label: 'Newfoundland and Labrador', codes: ['N.L.', 'NL'] },
	{ value: 'PEI', label: 'Prince Edward Island', codes: ['P.E.I.', 'PE', 'PEI'] },
	{ value: 'NS', label: 'Nova Scotia', codes: ['N.S.', 'NS'] },
	{ value: 'NB', label: 'New Brunswick', codes: ['N.B.', 'NB'] },
	{ value: 'QC', label: 'Quebec', codes: ['Que.', 'QC'] },
	{ value: 'ON', label: 'Ontario', codes: ['Ont.', 'ON'] },
	{ value: 'MB', label: 'Manitoba', codes: ['Man.', 'MB'] },
	{ value: 'SK', label: 'Saskatchewan', codes: ['Sask.', 'SK'] },
	{ value: 'AB', label: 'Alberta', codes: ['Alta.', 'AB'] },
	{ value: 'BC', label: 'British Columbia', codes: ['B.C.', 'BC'] },
	{ value: 'YT', label: 'Yukon', codes: ['Y.T.', 'YT'] },
	{ value: 'NT', label: 'Northwest Territories', codes: ['N.W.T.', 'NT', 'NWT'] },
	{ value: 'NU', label: 'Nunavut', codes: ['Nun.', 'NU'] }
];

const REGION_CODE_ALIASES = {
	NL: 'NL',
	NEWFOUNDLAND: 'NL',
	NEWFOUNDLANDANDLABRADOR: 'NL',
	NFLD: 'NL',
	PE: 'PEI',
	PEI: 'PEI',
	PRINCEEDWARDISLAND: 'PEI',
	NS: 'NS',
	NOVASCOTIA: 'NS',
	NB: 'NB',
	NEWBRUNSWICK: 'NB',
	QC: 'QC',
	QUE: 'QC',
	QUEBEC: 'QC',
	ON: 'ON',
	ONT: 'ON',
	ONTARIO: 'ON',
	MB: 'MB',
	MAN: 'MB',
	MANITOBA: 'MB',
	SK: 'SK',
	SASK: 'SK',
	SASKATCHEWAN: 'SK',
	AB: 'AB',
	ALTA: 'AB',
	ALBERTA: 'AB',
	BC: 'BC',
	BRITISHCOLUMBIA: 'BC',
	YT: 'YT',
	YUKON: 'YT',
	YK: 'YT',
	NT: 'NT',
	NWT: 'NT',
	NORTHWESTTERRITORIES: 'NT',
	NU: 'NU',
	NUN: 'NU',
	NUNAVUT: 'NU'
};

const RIDING_PREFIX_TO_REGION = {
	10: 'NL',
	11: 'PEI',
	12: 'NS',
	13: 'NB',
	24: 'QC',
	35: 'ON',
	46: 'MB',
	47: 'SK',
	48: 'AB',
	59: 'BC',
	60: 'YT',
	61: 'NT',
	62: 'NU'
};

function toCanonicalRegionCode(value) {
	const normalized = String(value ?? '')
		.toUpperCase()
		.replace(/[^A-Z]/g, '');
	return REGION_CODE_ALIASES[normalized] ?? normalized;
}

function inferRegionCodeFromRidingId(ridingId) {
	const digits = String(ridingId ?? '').replace(/\D/g, '');
	if (digits.length < 2) return '';
	const prefix = Number(digits.slice(0, 2));
	return RIDING_PREFIX_TO_REGION[prefix] ?? '';
}

export const canadaRegionProfile = {
	getRegionOptions: () => REGION_OPTIONS,
	toCanonicalRegionCode,
	resolveRegionCode: ({ riding, row }) => {
		return riding?.subnational || inferRegionCodeFromRidingId(row?.ridingId);
	}
};
