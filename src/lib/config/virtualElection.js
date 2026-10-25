// Election rules derived from the country configs in ./countries (via ./electionCountries.js).
// Kept as the stable import path for the rest of the app; nothing here is country-specific.
//
// Relative import (not "@/"): this module is also loaded by Node scripts outside Next.js.
import {
	DEFAULT_COUNTRY,
	ELECTION_COUNTRIES,
	ELECTION_SITES,
	PARTY_CATALOGUE
} from './electionCountries.js';

// Allowed party codes per country (upper-case country code). Their order is irrelevant: consumers
// use getAllowedPartiesForScope(), which applies sortPartiesForDisplay().
export const VIRTUAL_ELECTION_ALLOWED_PARTIES_BY_COUNTRY = Object.fromEntries(
	ELECTION_COUNTRIES.map((country) => [country.code.toUpperCase(), Object.keys(country.parties)])
);

// Deterministic last-resort IRV tie-break order per preferential country, independent of the
// display order so reordering the UI never changes counting results.
export const IRV_TIE_BREAK_ORDER_BY_COUNTRY = Object.fromEntries(
	ELECTION_COUNTRIES.filter((country) => country.irvTieBreakOrder).map((country) => [
		country.code.toUpperCase(),
		country.irvTieBreakOrder
	])
);

// Countries that use a full preferential (ranked) ballot instead of a single party choice.
export const PREFERENTIAL_COUNTRIES = ELECTION_COUNTRIES.filter(
	(country) => country.votingSystem === 'preferential'
).map((country) => country.code.toUpperCase());

export function isPreferentialScope(scope) {
	const countryCode = String(scope?.country ?? '').toUpperCase();
	return PREFERENTIAL_COUNTRIES.includes(countryCode);
}

// Every scope that has an election page; the default country's first page is the default view.
export const VIRTUAL_ELECTION_ALLOWED_SCOPES = ELECTION_SITES.map((site) => site.scope);
export const DEFAULT_SCOPE = VIRTUAL_ELECTION_ALLOWED_SCOPES.find(
	(scope) => scope.country === DEFAULT_COUNTRY.code
);

// Party presentation metadata (name, short name, colors, logo) used by map/charts/legend rendering.
export const FEDERAL_PARTIES = PARTY_CATALOGUE;
// Party codes that always sort after the regular parties: independents first, then "others".
const TRAILING_PARTY_CODES = ['IND', 'Independent', 'OTH'];

/**
 * Display order for party lists (dropdowns, legends, ballots), shared by every country:
 * alphabetical by full name (accent-insensitive, so "Bündnis" sorts like "Bundnis"), with
 * independents and "others" last. Does not mutate the input.
 *
 * @param {string[]} partyCodes
 * @returns {string[]}
 */
export function sortPartiesForDisplay(partyCodes) {
	const trailingRank = (code) => {
		const index = TRAILING_PARTY_CODES.indexOf(code);
		if (index === -1) return 0;
		return code === 'OTH' ? 2 : 1;
	};
	const fullName = (code) => FEDERAL_PARTIES[code]?.name ?? code;
	return [...partyCodes].sort(
		(a, b) =>
			trailingRank(a) - trailingRank(b) ||
			fullName(a).localeCompare(fullName(b), 'en', { sensitivity: 'base' }) ||
			a.localeCompare(b)
	);
}

export function getAllowedPartiesForScope(scope) {
	const countryCode = String(scope?.country ?? DEFAULT_SCOPE.country).toUpperCase();
	const allowed =
		VIRTUAL_ELECTION_ALLOWED_PARTIES_BY_COUNTRY[countryCode] ??
		VIRTUAL_ELECTION_ALLOWED_PARTIES_BY_COUNTRY[DEFAULT_SCOPE.country.toUpperCase()];
	return sortPartiesForDisplay(allowed);
}
