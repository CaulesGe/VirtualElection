import { DEFAULT_COUNTRY, ELECTION_COUNTRIES, getDivisions } from '@/lib/config/electionCountries';
import { createPmtilesAdapter } from './createPmtilesAdapter';
import { createTopoJsonAdapter } from './createTopoJsonAdapter';
import { assertMapAdapter } from './types';
import { usaMapAdapter } from './usa';

// Countries whose `map.renderer` is 'custom' provide their own adapter.
const CUSTOM_ADAPTERS = {
	US: usaMapAdapter
};

function createAdapter(country) {
	const countryCode = country.code.toUpperCase();
	const { map } = country;
	if (map.renderer === 'maplibre') {
		return createPmtilesAdapter(countryCode, map, getDivisions(country.code));
	}
	if (map.renderer === 'leaflet') {
		return createTopoJsonAdapter(countryCode, map);
	}
	return CUSTOM_ADAPTERS[countryCode];
}

const registry = Object.fromEntries(
	ELECTION_COUNTRIES.map((country) => [
		country.code.toUpperCase(),
		assertMapAdapter(createAdapter(country))
	])
);
const defaultAdapter = registry[DEFAULT_COUNTRY.code.toUpperCase()];

export function getMapAdapter(countryCode) {
	const normalized = String(countryCode ?? '').trim().toUpperCase();
	return registry[normalized] ?? defaultAdapter;
}
