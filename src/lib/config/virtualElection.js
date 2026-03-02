export const VIRTUAL_ELECTION_ALLOWED_PARTIES = ['LPC', 'CPC', 'GPC', 'PPC', 'BQ', 'NDP', 'OTH'];
export const VIRTUAL_ELECTION_ALLOWED_PARTIES_US = ['DEM', 'REP', 'IND'];
export const VIRTUAL_ELECTION_ALLOWED_PARTIES_BY_COUNTRY = {
	CA: VIRTUAL_ELECTION_ALLOWED_PARTIES,
	US: VIRTUAL_ELECTION_ALLOWED_PARTIES_US
};

export const VIRTUAL_ELECTION_ALLOWED_SCOPES = [
	{
		country: 'ca',
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
	}
};

export function getAllowedPartiesForScope(scope) {
	const countryCode = String(scope?.country ?? DEFAULT_SCOPE.country).toUpperCase();
	return VIRTUAL_ELECTION_ALLOWED_PARTIES_BY_COUNTRY[countryCode] ?? VIRTUAL_ELECTION_ALLOWED_PARTIES;
}
