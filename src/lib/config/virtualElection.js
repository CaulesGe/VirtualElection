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
export const VIRTUAL_ELECTION_ALLOWED_PARTIES_BY_COUNTRY = {
	CA: VIRTUAL_ELECTION_ALLOWED_PARTIES,
	US: VIRTUAL_ELECTION_ALLOWED_PARTIES_US,
	UK: VIRTUAL_ELECTION_ALLOWED_PARTIES_UK
};

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
		name: 'Liberal Party',
		color: '#CF3434',
		backgroundColor: 'bg-lib',
		textColor: 'text-lib',
		colorGradient: ['#FF7070', '#FF5757', '#F23636', '#CC2020', '#9E1414', '#6B0000'],
		shortName: 'LPC',
		logo: '/party/ca/fed/LPC.svg'
	},
	CPC: {
		name: 'Conservative Party',
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
		name: 'Green Party',
		shortName: 'GPC',
		color: '#5D9C4C',
		backgroundColor: 'bg-grn',
		textColor: 'text-grn',
		logo: '/party/ca/fed/GPC.svg',
		colorGradient: ['#5FE070', '#4DD65D', '#2BBF42', '#259A35', '#1A7A28', '#0A5518']
	},
	PPC: {
		name: "People's Party",
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
	}
};

export function getAllowedPartiesForScope(scope) {
	const countryCode = String(scope?.country ?? DEFAULT_SCOPE.country).toUpperCase();
	return VIRTUAL_ELECTION_ALLOWED_PARTIES_BY_COUNTRY[countryCode] ?? VIRTUAL_ELECTION_ALLOWED_PARTIES;
}
