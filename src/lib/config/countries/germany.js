import { SHARED_PARTIES } from './sharedParties.js';
// Generated from Germany.pmtiles by scripts/extract-de-divisions.mjs (--check verifies it).
import divisions from '../../data/deDivisions.json' with { type: 'json' };

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

const germany = {
	code: 'de',
	name: 'Germany',
	region: 'Europe',
	basePath: '/germany',
	entryRoute: '/germany',
	flag: '/static/flags/Germany.svg',
	home: {
		badge: 'Bundestag',
		subtitle:
			'Pick the party for your constituency and watch the race across all 299 Bundestag constituencies.',
		cta: 'Open Germany election'
	},

	// First vote (Erststimme) only; CDU and CSU are one entry, OTH collects every remaining party.
	votingSystem: 'single',
	parties: {
		CDU: party('Christlich Demokratische Union/Christlich-Soziale Union', 'CDU/CSU', '#262626', 'cdu', ['#A6A6A6', '#808080', '#595959', '#262626', '#1A1A1A', '#0D0D0D']),
		AFD: party('Alternative für Deutschland', 'AfD', '#009EE0', 'afd', ['#99D8F3', '#66C5EC', '#33B1E6', '#009EE0', '#007AAE', '#00557A']),
		SPD: party('Sozialdemokratische Partei Deutschlands', 'SPD', '#E3000F', 'spd', ['#F59AA1', '#EF6670', '#E93341', '#E3000F', '#B1000C', '#7C0008']),
		GRUNE: party('Bündnis 90/Die Grünen', 'Grüne', '#46962B', 'grune', ['#A9D49A', '#88C275', '#67AF50', '#46962B', '#367421', '#264F17']),
		LINKE: party('Die Linke', 'Linke', '#BE3075', 'linke', ['#E5A0C0', '#D870A0', '#CB4F8A', '#BE3075', '#95265C', '#6A1B42']),
		BSW: party('Bündnis Sahra Wagenknecht', 'BSW', '#792350', 'bsw', ['#C79BB3', '#A8678A', '#8F416C', '#792350', '#5D1B3E', '#40122B']),
		FDP: party('Freie Demokratische Partei', 'FDP', '#FFD700', 'fdp', ['#FFEE99', '#FFE466', '#FFDC33', '#FFD700', '#CCAC00', '#8F7800']),
		SSW: party('Südschleswigscher Wählerverband', 'SSW', '#003C8F', 'ssw', ['#8CA6CF', '#5A7DB5', '#2D5A9F', '#003C8F', '#002E6E', '#001F4A']),
		OTH: SHARED_PARTIES.OTH
	},

	map: {
		renderer: 'maplibre',
		asset: '/static/ridingMaps/Germany.pmtiles',
		// Layer "fed": one feature per constituency (code, WKR_NR, WKR_NAME, LAND_NR, LAND_NAME).
		sourceLayer: 'fed',
		nameProperty: 'WKR_NAME',
		versionPrefix: 'de-',
		regionKey: 'constituency',
		view: {
			bounds: [
				[5.5, 47.1],
				[15.4, 55.2]
			],
			center: [51.2, 10.4],
			zoom: 5,
			minZoom: 4,
			maxZoom: 14
		}
	},
	districts: { source: 'divisions', divisions },
	// One option per state (Bundesland), built from the division list.
	regions: { totalLabel: 'Germany (Total)', fromDivisions: true, resolve: ['subnational', 'division'] },

	sites: [
		{
			district: 'fed',
			year: 2025,
			route: '/germany',
			pageTitle: 'Germany - Bundestag (constituency vote)',
			historyLabel: 'Germany',
			seo: {
				title: 'Germany Bundestag Virtual Election',
				description:
					'Explore the 299 German Bundestag constituencies, cast a virtual constituency vote (Erststimme), and follow live seat and vote distribution updates across all 16 states.',
				ariaLabel: 'Germany election overview',
				intro:
					'Vote for the party you want to win your constituency. This simulates the first vote (Erststimme): the party with the most votes in each of the 299 constituencies wins that seat. The second vote and list seats are not part of this simulation. CDU and CSU are shown together.'
			}
		}
	]
};

export default germany;
