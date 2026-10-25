import { SHARED_PARTIES } from './sharedParties.js';

const canada = {
	code: 'ca',
	name: 'Canada',
	region: 'North America',
	basePath: '/canada',
	entryRoute: '/canada',
	flag: '/static/flags/Canada.svg.png',
	home: {
		badge: 'Federal',
		subtitle:
			'Explore all Canadian federal ridings and watch the national map update live as votes shift the race.',
		cta: 'Open Canada election'
	},

	votingSystem: 'single',
	parties: {
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
		OTH: SHARED_PARTIES.OTH
	},

	map: {
		renderer: 'leaflet',
		asset: '/static/ridingMaps/canada2025.json',
		idProperties: ['FED_NUM'],
		nameProperties: ['ED_NAMEE'],
		versionPrefix: '',
		regionKey: 'district',
		view: { center: [56, -96], zoom: 3.6, minZoom: 3, maxZoom: 18 }
	},
	// Ridings are read from the map asset at runtime (not stored in election_districts).
	districts: { source: 'map', seed: false },
	regions: {
		options: [
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
		],
		// Extra spellings beyond the option codes (normalized: A-Z only, upper case).
		aliases: {
			NEWFOUNDLAND: 'NL',
			NEWFOUNDLANDANDLABRADOR: 'NL',
			NFLD: 'NL',
			PRINCEEDWARDISLAND: 'PEI',
			NOVASCOTIA: 'NS',
			NEWBRUNSWICK: 'NB',
			QUE: 'QC',
			QUEBEC: 'QC',
			ONT: 'ON',
			ONTARIO: 'ON',
			MAN: 'MB',
			MANITOBA: 'MB',
			SASK: 'SK',
			SASKATCHEWAN: 'SK',
			ALTA: 'AB',
			ALBERTA: 'AB',
			BRITISHCOLUMBIA: 'BC',
			YUKON: 'YT',
			YK: 'YT',
			NORTHWESTTERRITORIES: 'NT',
			NUN: 'NU',
			NUNAVUT: 'NU'
		},
		// Riding subnational code, else the province from the first two digits of the riding number.
		resolve: [
			'subnational',
			{
				prefix: {
					from: 'rowId',
					digitsOnly: true,
					length: 2,
					map: {
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
					}
				}
			}
		]
	},

	sites: [
		{
			district: 'fed',
			year: 2025,
			route: '/canada',
			pageTitle: 'Canada',
			historyLabel: 'Canada',
			seo: {
				title: 'Canada Federal Virtual Election',
				description:
					'Explore the Canada federal election map, vote by riding, and track live virtual totals and regional seat/vote breakdowns.',
				ariaLabel: 'Canada election overview',
				intro:
					'Track Canada federal virtual election totals by riding, compare regional seat and vote distributions, and interact with the live map view.'
			}
		}
	]
};

export default canada;
