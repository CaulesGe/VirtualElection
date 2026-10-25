import { SHARED_PARTIES } from './sharedParties.js';

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

const france = {
	code: 'fr',
	name: 'France',
	region: 'Europe',
	basePath: '/france',
	entryRoute: '/france',
	flag: '/static/flags/France.svg',
	home: {
		badge: 'Assemblée nationale',
		subtitle:
			'Pick the political bloc for your circonscription and watch the first round across all 567 constituencies.',
		cta: 'Open France election'
	},

	// First round of the 2024 legislative election only: one choice per circonscription and the
	// bloc with the most votes leads it (the real runoff is not simulated). Blocs follow the
	// official ministry nuances; OTH collects everything else.
	votingSystem: 'single',
	parties: {
		RN: party('Rassemblement national', 'RN', '#004A77', 'rn', ['#80A5BB', '#4D86A2', '#266B8E', '#004A77', '#003759', '#00243B']),
		NFP: party('Nouveau Front populaire', 'NFP', '#BB1840', 'nfp', ['#E08AA0', '#D35C79', '#C73559', '#BB1840', '#8F1230', '#620C20']),
		ENS: party('Ensemble', 'ENS', '#FFD300', 'ens', ['#FFEC80', '#FFE24D', '#FFDA26', '#FFD300', '#CCA900', '#8F7500']),
		LR: party('Les Républicains', 'LR', '#0066CC', 'lr', ['#80B3E6', '#4D94DB', '#267CD3', '#0066CC', '#004C99', '#003366']),
		DVD: party('Divers droite', 'DVD', '#ADC1FD', 'dvd', ['#E0E9FF', '#CEDAFE', '#BCCDFE', '#ADC1FD', '#7F9AE0', '#5470B8']),
		DVG: party('Divers gauche', 'DVG', '#FFC0C0', 'dvg', ['#FFE6E6', '#FFD9D9', '#FFCCCC', '#FFC0C0', '#E09090', '#B86464']),
		OTH: SHARED_PARTIES.OTH
	},

	map: {
		renderer: 'leaflet',
		// Built from France.geojson by scripts/build-fr-map.mjs: simplified, with overseas
		// constituencies moved into insets in the Atlantic west of Brittany.
		asset: '/static/ridingMaps/France.json',
		assetVersion: '2', // bump whenever scripts/build-fr-map.mjs output changes (browser cache)
		idProperties: ['code'],
		nameProperties: ['name'],
		subnationalProperties: ['region'],
		versionPrefix: 'fr-',
		regionKey: 'constituency',
		view: { center: [46.3, -3.5], zoom: 5, minZoom: 4, maxZoom: 18 }
	},
	districts: { source: 'map', seed: true },
	regions: {
		options: [
			{ value: 'Total', label: 'France (Total)', codes: [] },
			{ value: 'ARA', label: 'Auvergne-Rhône-Alpes', codes: ['ARA', 'Auvergne-Rhône-Alpes'] },
			{ value: 'BFC', label: 'Bourgogne-Franche-Comté', codes: ['BFC', 'Bourgogne-Franche-Comté'] },
			{ value: 'BRE', label: 'Bretagne', codes: ['BRE', 'Bretagne'] },
			{ value: 'CVL', label: 'Centre-Val de Loire', codes: ['CVL', 'Centre-Val de Loire'] },
			{ value: 'COR', label: 'Corse', codes: ['COR', 'Corse'] },
			{ value: 'GES', label: 'Grand Est', codes: ['GES', 'Grand Est'] },
			{ value: 'HDF', label: 'Hauts-de-France', codes: ['HDF', 'Hauts-de-France'] },
			{ value: 'IDF', label: 'Île-de-France', codes: ['IDF', 'Île-de-France'] },
			{ value: 'NOR', label: 'Normandie', codes: ['NOR', 'Normandie'] },
			{ value: 'NAQ', label: 'Nouvelle-Aquitaine', codes: ['NAQ', 'Nouvelle-Aquitaine'] },
			{ value: 'OCC', label: 'Occitanie', codes: ['OCC', 'Occitanie'] },
			{ value: 'PDL', label: 'Pays de la Loire', codes: ['PDL', 'Pays de la Loire'] },
			{ value: 'PAC', label: "Provence-Alpes-Côte d'Azur", codes: ['PAC', "Provence-Alpes-Côte d'Azur"] },
			{ value: 'OM', label: 'Outre-mer', codes: ['OM', 'Outre-mer'] }
		],
		resolve: ['subnational']
	},

	sites: [
		{
			district: 'fed',
			year: 2024,
			route: '/france',
			pageTitle: 'France - Assemblée nationale (first round)',
			historyLabel: 'France',
			seo: {
				title: 'France Assemblée nationale Virtual Election',
				description:
					'Explore the 567 French legislative constituencies, cast a virtual first-round vote, and follow live seat and vote distribution updates across all regions and overseas territories.',
				ariaLabel: 'France election overview',
				intro:
					'Vote for the political bloc you want to lead your circonscription in the first round of the legislative election. The bloc with the most votes in each of the 567 constituencies leads it; the runoff is not part of this simulation. Overseas constituencies are shown in insets in the Atlantic.'
			}
		}
	]
};

export default france;
