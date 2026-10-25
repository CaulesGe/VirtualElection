import { SHARED_PARTIES } from './sharedParties.js';

// The USA is the one country with country-specific code: two map files (House districts and
// presidential states) whose district IDs are computed from FIPS codes. That logic lives in
// MapComponent/adapters/usa.js, regionBreakdown/profiles/usa.js and server/virtualElection/usRidings.js.
const usa = {
	code: 'us',
	name: 'USA',
	region: 'North America',
	basePath: '/usa',
	entryRoute: '/usa/president',
	flag: '/static/flags/USA.png',
	home: {
		badge: 'House & President',
		subtitle:
			'Battle across House districts or flip states in the Electoral College and race to 270 electoral votes.',
		cta: 'Open USA elections'
	},

	votingSystem: 'single',
	parties: {
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
		IND: SHARED_PARTIES.IND
	},

	map: {
		renderer: 'custom',
		versionPrefix: 'house-',
		regionKey: 'district'
	},
	districts: { source: 'custom' },
	regions: { source: 'custom' },

	sites: [
		{
			district: 'pres',
			year: 2025,
			route: '/usa/president',
			view: 'president',
			// Overrides the country map metadata for this scope.
			map: {
				versionPrefix: 'pres-',
				mode: 'president',
				regionKey: 'state',
				allocationRule: 'winner_take_all',
				electoralVotesVersion: '2020_apportionment'
			},
			pageTitle: 'USA - Presidential Election',
			historyLabel: 'USA-Presidential Election',
			seo: {
				title: 'USA Presidential Virtual Election',
				description:
					'Simulate the US presidential election with a live state map, electoral-vote projection, and virtual popular-vote totals.',
				ariaLabel: 'USA presidential election overview',
				intro:
					'Explore a live US presidential virtual election map with state-by-state outcomes, electoral-vote projections, and dynamic vote totals.'
			}
		},
		{
			district: 'fed',
			year: 2025,
			route: '/usa/houseOfRepresentatives',
			pageTitle: 'USA - House of Representatives',
			historyLabel: 'USA-House of Representatives',
			seo: {
				title: 'USA House Virtual Election',
				description:
					'Explore the US House district map, cast virtual votes, and monitor live district-level seat and vote totals.',
				ariaLabel: 'USA House election overview',
				intro:
					'Track US House virtual election outcomes by district with a live map, riding-level totals, and regional breakdowns.'
			}
		}
	]
};

export default usa;
