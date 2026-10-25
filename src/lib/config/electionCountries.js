// Country registry. Every country is one config file in ./countries (meta, parties and colors,
// map, districts, regions, pages); everything else (pages, header, home, sitemap, API, DB, map
// rendering, charts) is generic and reads from here. See "Adding a country" in README.md.
//
// Relative imports with explicit extensions only: this module is also loaded by Node scripts.
import australia from './countries/australia.js';
import canada from './countries/canada.js';
import france from './countries/france.js';
import germany from './countries/germany.js';
import uk from './countries/uk.js';
import usa from './countries/usa.js';

// Fallback for unknown scopes/routes and the default election view.
export const DEFAULT_COUNTRY = canada;

// Display order (home page, header, history page): alphabetical by country name.
export const ELECTION_COUNTRIES = [australia, canada, france, germany, uk, usa].sort((a, b) =>
	a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
);

// One entry per election page, with its full scope.
export const ELECTION_SITES = ELECTION_COUNTRIES.flatMap((country) =>
	country.sites.map((site) => ({
		...site,
		scope: { country: country.code, district: site.district, year: site.year }
	}))
);

// Party catalogue (code -> presentation) across all countries. A code may be shared by several
// countries only if it refers to the same definition (see countries/sharedParties.js).
export const PARTY_CATALOGUE = ELECTION_COUNTRIES.reduce((catalogue, country) => {
	for (const [code, party] of Object.entries(country.parties)) {
		if (catalogue[code] && catalogue[code] !== party) {
			throw new Error(`Party code "${code}" is defined differently by more than one country.`);
		}
		catalogue[code] = party;
	}
	return catalogue;
}, {});

export function getElectionCountry(code) {
	const normalized = String(code ?? '').toLowerCase();
	return ELECTION_COUNTRIES.find((country) => country.code === normalized) ?? null;
}

export function getElectionCountryFromPath(pathname) {
	const path = String(pathname ?? '');
	return (
		ELECTION_COUNTRIES.find(
			(country) => path === country.basePath || path.startsWith(`${country.basePath}/`)
		) ?? null
	);
}

export function getElectionSite(scope) {
	const country = String(scope?.country ?? '').toLowerCase();
	const district = String(scope?.district ?? '').toLowerCase();
	return (
		ELECTION_SITES.find(
			(site) => site.scope.country === country && site.scope.district === district
		) ?? null
	);
}

export function getElectionSiteByRoute(route) {
	return ELECTION_SITES.find((site) => site.route === route) ?? null;
}

// Committed division list ({ code, name, state, bbox, ... }) for PMTiles countries, else null.
export function getDivisions(countryCode) {
	const districts = getElectionCountry(countryCode)?.districts;
	return districts?.source === 'divisions' ? districts.divisions : null;
}
