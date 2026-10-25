import { SHARED_PARTIES } from './sharedParties.js';
// Generated from Austrilia.pmtiles by scripts/extract-au-divisions.mjs (--check verifies it).
import divisions from '../../data/auDivisions.json' with { type: 'json' };

function party(name, shortName, color, cssKey, colorGradient) {
	return {
		name,
		shortName,
		color,
		backgroundColor: `bg-${cssKey}`,
		textColor: `text-${cssKey}`,
		logo: '',
		colorGradient
	};
}

const australia = {
	code: 'au',
	name: 'Australia',
	region: 'Oceania',
	basePath: '/australia',
	entryRoute: '/australia',
	flag: '/static/flags/Australia.svg',
	home: {
		badge: 'House of Representatives',
		subtitle:
			'Rank every party on a preferential ballot and watch preferences flow across all 150 federal divisions.',
		cta: 'Open Australia election'
	},

	// Ranked ballot counted with instant-runoff voting (IRV).
	votingSystem: 'preferential',
	parties: {
		ALP: party('Australian Labor Party', 'ALP', '#E13940', 'alp', ['#F5A3A6', '#EE7C80', '#E85A60', '#E13940', '#B22B31', '#7F1D22']),
		LNP: party('Liberal–National Coalition', 'LNP', '#0A5A8C', 'lnp', ['#8DBBD8', '#5E9EC6', '#3482B2', '#0A5A8C', '#07446A', '#042C45']),
		GRN: party('Australian Greens', 'GRN', '#10C25B', 'grn-au', ['#8CE8B0', '#5FDB91', '#36CF76', '#10C25B', '#0C9948', '#07672F']),
		IND: SHARED_PARTIES.IND,
		ONP: party("Pauline Hanson's One Nation", 'ONP', '#F36F21', 'onp', ['#F9BC95', '#F6A06A', '#F58443', '#F36F21', '#C25819', '#8A3E11']),
		AFP: party('Australian Federation Party', 'AFP', '#F5D800', 'afp', ['#FBEF8A', '#F9E65C', '#F7DE2E', '#F5D800', '#C4AD00', '#8A7900']),
		OTH: SHARED_PARTIES.OTH
	},
	// Deterministic last-resort IRV tie-break order, independent of the display order. Matches the
	// primary-vote breakdown of the federal result.
	irvTieBreakOrder: ['ALP', 'LNP', 'GRN', 'IND', 'ONP', 'AFP', 'OTH'],

	map: {
		renderer: 'maplibre',
		asset: '/static/ridingMaps/Austrilia.pmtiles',
		// Layer "au-gen": features carry `code` and `name`.
		sourceLayer: 'au-gen',
		nameProperty: 'name',
		versionPrefix: 'au-',
		regionKey: 'division',
		view: {
			// Frames mainland Australia plus Tasmania.
			bounds: [
				[112.5, -44.5],
				[154.5, -10]
			],
			center: [-26, 134],
			zoom: 3,
			minZoom: 2,
			maxZoom: 14
		}
	},
	districts: { source: 'divisions', divisions },
	regions: {
		options: [
			{ value: 'Total', label: 'Australia (Total)', codes: [] },
			{ value: 'NSW', label: 'New South Wales', codes: ['NSW', 'NEWSOUTHWALES'] },
			{ value: 'VIC', label: 'Victoria', codes: ['VIC', 'VICTORIA'] },
			{ value: 'QLD', label: 'Queensland', codes: ['QLD', 'QUEENSLAND'] },
			{ value: 'WA', label: 'Western Australia', codes: ['WA', 'WESTERNAUSTRALIA'] },
			{ value: 'SA', label: 'South Australia', codes: ['SA', 'SOUTHAUSTRALIA'] },
			{ value: 'TAS', label: 'Tasmania', codes: ['TAS', 'TASMANIA'] },
			{ value: 'ACT', label: 'Australian Capital Territory', codes: ['ACT', 'AUSTRALIANCAPITALTERRITORY'] },
			{ value: 'NT', label: 'Northern Territory', codes: ['NT', 'NORTHERNTERRITORY'] }
		],
		resolve: ['subnational', 'division']
	},

	sites: [
		{
			district: 'fed',
			year: 2025,
			route: '/australia',
			pageTitle: 'Australia - House of Representatives',
			historyLabel: 'Australia',
			seo: {
				title: 'Australia House of Representatives Virtual Election',
				description:
					'Explore the 150 Australian federal divisions, rank every party on a preferential ballot, and follow live seat and first-preference results with instant-runoff preference counts.',
				ariaLabel: 'Australia election overview',
				intro:
					"Rank every party in order of preference. Each division is counted with preferential (instant-runoff) voting: the party with the fewest votes is eliminated and its ballots move to each voter's next preference until one party has a majority."
			}
		}
	]
};

export default australia;
