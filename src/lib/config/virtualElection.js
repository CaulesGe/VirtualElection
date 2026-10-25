export const VIRTUAL_ELECTION_ALLOWED_PARTIES = ['LPC', 'CPC', 'GPC', 'PPC', 'BQ', 'NDP', 'OTH'];
export const VIRTUAL_ELECTION_ALLOWED_PARTIES_US = ['DEM', 'REP', 'IND'];
export const VIRTUAL_ELECTION_ALLOWED_PARTIES_UK = [
	'Labour Party',
	'Conservative Party',
	'Liberal Democrats',
	'Scottish National Party',
	'Sinn Féin',
	'Independent',
	'Reform UK',
	'Democratic Unionist Party',
	'Green Party of England and Wales',
	'Plaid Cymru',
	'Social Democratic and Labour Party',
	'Alliance Party of Northern Ireland',
	'Ulster Unionist Party',
	'Traditional Unionist Voice',
	'Restore Britain'
];
// Australia (House of Representatives): ranked ballot. The order below is also the
// deterministic last-resort tie-break order used by IRV counting.
// Matches the primary-vote breakdown of the federal result: Labor, Liberal-National Coalition,
// Greens, Independents, One Nation, Australian Federation Party and Others.
export const VIRTUAL_ELECTION_ALLOWED_PARTIES_AU = [
	'ALP',
	'LNP',
	'GRN',
	'IND',
	'ONP',
	'AFP',
	'OTH'
];

// Germany (Bundestag, first vote / Erststimme only): CDU and CSU are one entry. Ordered by
// the national vote share of the last result; OTH collects every remaining party.
export const VIRTUAL_ELECTION_ALLOWED_PARTIES_DE = [
	'CDU',
	'AFD',
	'SPD',
	'GRUNE',
	'LINKE',
	'BSW',
	'FDP',
	'SSW',
	'OTH'
];

export const VIRTUAL_ELECTION_ALLOWED_PARTIES_BY_COUNTRY = {
	CA: VIRTUAL_ELECTION_ALLOWED_PARTIES,
	DE: VIRTUAL_ELECTION_ALLOWED_PARTIES_DE,
	US: VIRTUAL_ELECTION_ALLOWED_PARTIES_US,
	UK: VIRTUAL_ELECTION_ALLOWED_PARTIES_UK,
	AU: VIRTUAL_ELECTION_ALLOWED_PARTIES_AU
};

// Scopes that use a full preferential (ranked) ballot instead of a single party choice.
export const PREFERENTIAL_COUNTRIES = ['AU'];

export function isPreferentialScope(scope) {
	const countryCode = String(scope?.country ?? '').toUpperCase();
	return PREFERENTIAL_COUNTRIES.includes(countryCode);
}

export const VIRTUAL_ELECTION_ALLOWED_SCOPES = [
	{
		country: 'ca',
		district: 'fed',
		year: 2025
	},
	{
		country: 'uk',
		district: 'fed',
		year: 2025
	},
	{
		country: 'au',
		district: 'fed',
		year: 2025
	},
	{
		country: 'de',
		district: 'fed',
		year: 2025
	},
	{
		country: 'us',
		district: 'fed',
		year: 2025
	},
	{
		country: 'us',
		district: 'pres',
		year: 2025
	}
];

export const DEFAULT_SCOPE = {
	country: 'ca',
	district: 'fed',
	year: 2025
};

// Default party presentation metadata used by map/charts/legend rendering.
export const FEDERAL_PARTIES = {
	LPC: {
		name: 'Liberal Party of Canada',
		color: '#CF3434',
		backgroundColor: 'bg-lib',
		textColor: 'text-lib',
		colorGradient: ['#FF7070', '#FF5757', '#F23636', '#CC2020', '#9E1414', '#6B0000'],
		shortName: 'LPC',
		logo: '/party/ca/fed/LPC.svg'
	},
	CPC: {
		name: 'Conservative Party of Canada',
		color: '#1A4782',
		backgroundColor: 'bg-con',
		textColor: 'text-con',
		colorGradient: ['#7AA3FF', '#5588FF', '#4270F0', '#3260D8', '#1E47A8', '#002570'],
		shortName: 'CPC',
		logo: '/party/ca/fed/CPC.svg'
	},
	NDP: {
		name: 'New Democratic Party',
		shortName: 'NDP',
		color: '#FF8000',
		backgroundColor: 'bg-ndp',
		textColor: 'text-ndp',
		logo: '/party/ca/fed/NDP.svg',
		colorGradient: ['#FFA85C', '#FF9135', '#E8801E', '#C4651A', '#A0520F', '#7A3F0A']
	},
	GPC: {
		name: 'Green Party of Canada',
		shortName: 'GPC',
		color: '#5D9C4C',
		backgroundColor: 'bg-grn',
		textColor: 'text-grn',
		logo: '/party/ca/fed/GPC.svg',
		colorGradient: ['#5FE070', '#4DD65D', '#2BBF42', '#259A35', '#1A7A28', '#0A5518']
	},
	PPC: {
		name: "People's Party of Canada",
		shortName: 'PPC',
		color: '#800080',
		backgroundColor: 'bg-ppc',
		textColor: 'text-ppc',
		logo: '/party/ca/fed/PPC.png',
		colorGradient: ['#C675FF', '#B658FF', '#A040E8', '#8A2BC8', '#6B1FA0', '#3E0068']
	},
	BQ: {
		name: 'Bloc Québécois',
		shortName: 'BQ',
		color: '#00AEEF',
		backgroundColor: 'bg-bq',
		textColor: 'text-bq',
		logo: '/party/ca/fed/BQ.svg',
		colorGradient: ['#58E0F0', '#35CCE0', '#2AB8C8', '#229AA8', '#157A85', '#005560']
	},
	OTH: {
		name: 'Others',
		shortName: 'OTH',
		color: '#808080',
		backgroundColor: 'bg-oth',
		textColor: 'text-oth',
		logo: '/party/ca/fed/OTH.svg',
		colorGradient: ['#ABABAB', '#999999', '#8A8A8A', '#7A7A7A', '#616161', '#424242']
	},
	DEM: {
		name: 'Democratic Party',
		shortName: 'DEM',
		color: '#2E74C0',
		backgroundColor: 'bg-dem',
		textColor: 'text-dem',
		logo: '',
		colorGradient: ['#A4CCF5', '#7CB1EB', '#5B98DE', '#3E81D1', '#2A67B0', '#1C4E8D']
	},
	REP: {
		name: 'Republican Party',
		shortName: 'REP',
		color: '#C43E3E',
		backgroundColor: 'bg-rep',
		textColor: 'text-rep',
		logo: '',
		colorGradient: ['#F2A3A3', '#E98787', '#DD6C6C', '#D05252', '#B13A3A', '#8E2A2A']
	},
	IND: {
		name: 'Independent',
		shortName: 'IND',
		color: '#6B7280',
		backgroundColor: 'bg-ind',
		textColor: 'text-ind',
		logo: '',
		colorGradient: ['#B6BDC8', '#9EA6B3', '#8A93A0', '#747D8A', '#5E6672', '#474E59']
	},
	'Labour Party': {
		name: 'Labour Party',
		shortName: 'LAB',
		color: '#E4003B',
		backgroundColor: 'bg-lab',
		textColor: 'text-lab',
		logo: '',
		colorGradient: ['#FF8AA8', '#FF668D', '#F24577', '#E4003B', '#B3002E', '#7A001F']
	},
	'Conservative Party': {
		name: 'Conservative Party',
		shortName: 'CON',
		color: '#0087DC',
		backgroundColor: 'bg-con-uk',
		textColor: 'text-con-uk',
		logo: '',
		colorGradient: ['#8FD4FF', '#5CC1FF', '#2AAAF2', '#0087DC', '#006AAE', '#004C7D']
	},
	'Liberal Democrats': {
		name: 'Liberal Democrats',
		shortName: 'LD',
		color: '#FDBB30',
		backgroundColor: 'bg-ld',
		textColor: 'text-ld',
		logo: '',
		colorGradient: ['#FFE09A', '#FFD36F', '#FFC650', '#FDBB30', '#D69518', '#9F6D0B']
	},
	'Scottish National Party': {
		name: 'Scottish National Party',
		shortName: 'SNP',
		color: '#FFF95D',
		backgroundColor: 'bg-snp',
		textColor: 'text-snp',
		logo: '',
		colorGradient: ['#FFFDA6', '#FFF98A', '#FFF56E', '#FFF95D', '#E4D84A', '#B5A82F']
	},
	'Sinn Féin': {
		name: 'Sinn Féin',
		shortName: 'SF',
		color: '#326760',
		backgroundColor: 'bg-sf',
		textColor: 'text-sf',
		logo: '',
		colorGradient: ['#7EA9A3', '#5E9088', '#4A7F76', '#326760', '#234C46', '#15312D']
	},
	Independent: {
		name: 'Independent',
		shortName: 'IND',
		color: '#6B7280',
		backgroundColor: 'bg-ind-uk',
		textColor: 'text-ind-uk',
		logo: '',
		colorGradient: ['#B6BDC8', '#9EA6B3', '#8A93A0', '#747D8A', '#5E6672', '#474E59']
	},
	'Reform UK': {
		name: 'Reform UK',
		shortName: 'REF',
		color: '#12B6CF',
		backgroundColor: 'bg-ref',
		textColor: 'text-ref',
		logo: '',
		colorGradient: ['#8BE6F2', '#5DD7EA', '#37CADF', '#12B6CF', '#0E8EA2', '#096875']
	},
	'Democratic Unionist Party': {
		name: 'Democratic Unionist Party',
		shortName: 'DUP',
		color: '#D46A00',
		backgroundColor: 'bg-dup',
		textColor: 'text-dup',
		logo: '',
		colorGradient: ['#F5B77A', '#ED9B52', '#E4832C', '#D46A00', '#A65300', '#783B00']
	},
	'Green Party of England and Wales': {
		name: 'Green Party of England and Wales',
		shortName: 'GRN',
		color: '#6AB023',
		backgroundColor: 'bg-grn-uk',
		textColor: 'text-grn-uk',
		logo: '',
		colorGradient: ['#A8D981', '#8CC85A', '#7ABD3E', '#6AB023', '#4F8617', '#365D0E']
	},
	'Plaid Cymru': {
		name: 'Plaid Cymru',
		shortName: 'PC',
		color: '#008142',
		backgroundColor: 'bg-pc',
		textColor: 'text-pc',
		logo: '',
		colorGradient: ['#77C89D', '#4FB57F', '#2EA566', '#008142', '#006334', '#004626']
	},
	'Social Democratic and Labour Party': {
		name: 'Social Democratic and Labour Party',
		shortName: 'SDLP',
		color: '#3CB371',
		backgroundColor: 'bg-sdlp',
		textColor: 'text-sdlp',
		logo: '',
		colorGradient: ['#96D8B0', '#73CB97', '#57C182', '#3CB371', '#2E8A56', '#20603B']
	},
	'Alliance Party of Northern Ireland': {
		name: 'Alliance Party of Northern Ireland',
		shortName: 'APNI',
		color: '#F6C100',
		backgroundColor: 'bg-apni',
		textColor: 'text-apni',
		logo: '',
		colorGradient: ['#FFE38C', '#FFD95E', '#FFD133', '#F6C100', '#C79C00', '#927200']
	},
	'Ulster Unionist Party': {
		name: 'Ulster Unionist Party',
		shortName: 'UUP',
		color: '#2B4EA2',
		backgroundColor: 'bg-uup',
		textColor: 'text-uup',
		logo: '',
		colorGradient: ['#91A6D8', '#6F88CB', '#5573BE', '#2B4EA2', '#1F3A7A', '#14284F']
	},
	'Traditional Unionist Voice': {
		name: 'Traditional Unionist Voice',
		shortName: 'TUV',
		color: '#0D5BA6',
		backgroundColor: 'bg-tuv',
		textColor: 'text-tuv',
		logo: '',
		colorGradient: ['#7FAED8', '#5996CA', '#3A80BD', '#0D5BA6', '#09457F', '#053058']
	},
	'Restore Britain': {
		name: 'Restore Britain',
		shortName: 'Restore Britain',
		color: '#9B1C31',
		backgroundColor: 'bg-rb',
		textColor: 'text-rb',
		logo: '',
		colorGradient: ['#D58A98', '#C96579', '#B9475F', '#9B1C31', '#771524', '#520D18']
	},
	// Australia. IND and OTH are shared with the US / Canada definitions above.
	ALP: {
		name: 'Australian Labor Party',
		shortName: 'ALP',
		color: '#E13940',
		backgroundColor: 'bg-alp',
		textColor: 'text-alp',
		logo: '',
		colorGradient: ['#F5A3A6', '#EE7C80', '#E85A60', '#E13940', '#B22B31', '#7F1D22']
	},
	LNP: {
		name: 'Liberal–National Coalition',
		shortName: 'LNP',
		color: '#0A5A8C',
		backgroundColor: 'bg-lnp',
		textColor: 'text-lnp',
		logo: '',
		colorGradient: ['#8DBBD8', '#5E9EC6', '#3482B2', '#0A5A8C', '#07446A', '#042C45']
	},
	GRN: {
		name: 'Australian Greens',
		shortName: 'GRN',
		color: '#10C25B',
		backgroundColor: 'bg-grn-au',
		textColor: 'text-grn-au',
		logo: '',
		colorGradient: ['#8CE8B0', '#5FDB91', '#36CF76', '#10C25B', '#0C9948', '#07672F']
	},
	ONP: {
		name: "Pauline Hanson's One Nation",
		shortName: 'ONP',
		color: '#F36F21',
		backgroundColor: 'bg-onp',
		textColor: 'text-onp',
		logo: '',
		colorGradient: ['#F9BC95', '#F6A06A', '#F58443', '#F36F21', '#C25819', '#8A3E11']
	},
	AFP: {
		name: 'Australian Federation Party',
		shortName: 'AFP',
		color: '#F5D800',
		backgroundColor: 'bg-afp',
		textColor: 'text-afp',
		logo: '',
		colorGradient: ['#FBEF8A', '#F9E65C', '#F7DE2E', '#F5D800', '#C4AD00', '#8A7900']
	},
	// Germany. Party names are German; OTH is shared with the Canada definition above.
	CDU: {
		name: 'Christlich Demokratische Union/Christlich-Soziale Union',
		shortName: 'CDU/CSU',
		color: '#262626',
		backgroundColor: 'bg-cdu',
		textColor: 'text-cdu',
		logo: '',
		colorGradient: ['#A6A6A6', '#808080', '#595959', '#262626', '#1A1A1A', '#0D0D0D']
	},
	AFD: {
		name: 'Alternative für Deutschland',
		shortName: 'AfD',
		color: '#009EE0',
		backgroundColor: 'bg-afd',
		textColor: 'text-afd',
		logo: '',
		colorGradient: ['#99D8F3', '#66C5EC', '#33B1E6', '#009EE0', '#007AAE', '#00557A']
	},
	SPD: {
		name: 'Sozialdemokratische Partei Deutschlands',
		shortName: 'SPD',
		color: '#E3000F',
		backgroundColor: 'bg-spd',
		textColor: 'text-spd',
		logo: '',
		colorGradient: ['#F59AA1', '#EF6670', '#E93341', '#E3000F', '#B1000C', '#7C0008']
	},
	GRUNE: {
		name: 'Bündnis 90/Die Grünen',
		shortName: 'Grüne',
		color: '#46962B',
		backgroundColor: 'bg-grune',
		textColor: 'text-grune',
		logo: '',
		colorGradient: ['#A9D49A', '#88C275', '#67AF50', '#46962B', '#367421', '#264F17']
	},
	LINKE: {
		name: 'Die Linke',
		shortName: 'Linke',
		color: '#BE3075',
		backgroundColor: 'bg-linke',
		textColor: 'text-linke',
		logo: '',
		colorGradient: ['#E5A0C0', '#D870A0', '#CB4F8A', '#BE3075', '#95265C', '#6A1B42']
	},
	BSW: {
		name: 'Bündnis Sahra Wagenknecht',
		shortName: 'BSW',
		color: '#792350',
		backgroundColor: 'bg-bsw',
		textColor: 'text-bsw',
		logo: '',
		colorGradient: ['#C79BB3', '#A8678A', '#8F416C', '#792350', '#5D1B3E', '#40122B']
	},
	FDP: {
		name: 'Freie Demokratische Partei',
		shortName: 'FDP',
		color: '#FFD700',
		backgroundColor: 'bg-fdp',
		textColor: 'text-fdp',
		logo: '',
		colorGradient: ['#FFEE99', '#FFE466', '#FFDC33', '#FFD700', '#CCAC00', '#8F7800']
	},
	SSW: {
		name: 'Südschleswigscher Wählerverband',
		shortName: 'SSW',
		color: '#003C8F',
		backgroundColor: 'bg-ssw',
		textColor: 'text-ssw',
		logo: '',
		colorGradient: ['#8CA6CF', '#5A7DB5', '#2D5A9F', '#003C8F', '#002E6E', '#001F4A']
	}
};

export function getAllowedPartiesForScope(scope) {
	const countryCode = String(scope?.country ?? DEFAULT_SCOPE.country).toUpperCase();
	return VIRTUAL_ELECTION_ALLOWED_PARTIES_BY_COUNTRY[countryCode] ?? VIRTUAL_ELECTION_ALLOWED_PARTIES;
}
