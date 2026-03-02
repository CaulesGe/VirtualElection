export const US_PRESIDENT_ELECTORAL_VOTES_VERSION = '2020_apportionment';

export const US_STATE_FIPS_METADATA = {
	'01': { code: 'AL', name: 'Alabama', electoralVotes: 9 },
	'02': { code: 'AK', name: 'Alaska', electoralVotes: 3 },
	'04': { code: 'AZ', name: 'Arizona', electoralVotes: 11 },
	'05': { code: 'AR', name: 'Arkansas', electoralVotes: 6 },
	'06': { code: 'CA', name: 'California', electoralVotes: 54 },
	'08': { code: 'CO', name: 'Colorado', electoralVotes: 10 },
	'09': { code: 'CT', name: 'Connecticut', electoralVotes: 7 },
	'10': { code: 'DE', name: 'Delaware', electoralVotes: 3 },
	'11': { code: 'DC', name: 'District of Columbia', electoralVotes: 3 },
	'12': { code: 'FL', name: 'Florida', electoralVotes: 30 },
	'13': { code: 'GA', name: 'Georgia', electoralVotes: 16 },
	'15': { code: 'HI', name: 'Hawaii', electoralVotes: 4 },
	'16': { code: 'ID', name: 'Idaho', electoralVotes: 4 },
	'17': { code: 'IL', name: 'Illinois', electoralVotes: 19 },
	'18': { code: 'IN', name: 'Indiana', electoralVotes: 11 },
	'19': { code: 'IA', name: 'Iowa', electoralVotes: 6 },
	'20': { code: 'KS', name: 'Kansas', electoralVotes: 6 },
	'21': { code: 'KY', name: 'Kentucky', electoralVotes: 8 },
	'22': { code: 'LA', name: 'Louisiana', electoralVotes: 8 },
	'23': { code: 'ME', name: 'Maine', electoralVotes: 4 },
	'24': { code: 'MD', name: 'Maryland', electoralVotes: 10 },
	'25': { code: 'MA', name: 'Massachusetts', electoralVotes: 11 },
	'26': { code: 'MI', name: 'Michigan', electoralVotes: 15 },
	'27': { code: 'MN', name: 'Minnesota', electoralVotes: 10 },
	'28': { code: 'MS', name: 'Mississippi', electoralVotes: 6 },
	'29': { code: 'MO', name: 'Missouri', electoralVotes: 10 },
	'30': { code: 'MT', name: 'Montana', electoralVotes: 4 },
	'31': { code: 'NE', name: 'Nebraska', electoralVotes: 5 },
	'32': { code: 'NV', name: 'Nevada', electoralVotes: 6 },
	'33': { code: 'NH', name: 'New Hampshire', electoralVotes: 4 },
	'34': { code: 'NJ', name: 'New Jersey', electoralVotes: 14 },
	'35': { code: 'NM', name: 'New Mexico', electoralVotes: 5 },
	'36': { code: 'NY', name: 'New York', electoralVotes: 28 },
	'37': { code: 'NC', name: 'North Carolina', electoralVotes: 16 },
	'38': { code: 'ND', name: 'North Dakota', electoralVotes: 3 },
	'39': { code: 'OH', name: 'Ohio', electoralVotes: 17 },
	'40': { code: 'OK', name: 'Oklahoma', electoralVotes: 7 },
	'41': { code: 'OR', name: 'Oregon', electoralVotes: 8 },
	'42': { code: 'PA', name: 'Pennsylvania', electoralVotes: 19 },
	'44': { code: 'RI', name: 'Rhode Island', electoralVotes: 4 },
	'45': { code: 'SC', name: 'South Carolina', electoralVotes: 9 },
	'46': { code: 'SD', name: 'South Dakota', electoralVotes: 3 },
	'47': { code: 'TN', name: 'Tennessee', electoralVotes: 11 },
	'48': { code: 'TX', name: 'Texas', electoralVotes: 40 },
	'49': { code: 'UT', name: 'Utah', electoralVotes: 6 },
	'50': { code: 'VT', name: 'Vermont', electoralVotes: 3 },
	'51': { code: 'VA', name: 'Virginia', electoralVotes: 13 },
	'53': { code: 'WA', name: 'Washington', electoralVotes: 12 },
	'54': { code: 'WV', name: 'West Virginia', electoralVotes: 4 },
	'55': { code: 'WI', name: 'Wisconsin', electoralVotes: 10 },
	'56': { code: 'WY', name: 'Wyoming', electoralVotes: 3 }
};

export function normalizeStateFips(value) {
	const digits = String(value ?? '').replace(/\D/g, '');
	if (!digits) return '';
	return digits.padStart(2, '0').slice(-2);
}

export function toUsPresidentDistrictKey({ year = 2025, fips }) {
	const normalized = normalizeStateFips(fips);
	if (!normalized) return '';
	return `US-PRES-${Number(year)}-${normalized}`;
}
