// Reads a country's districts from its TopoJSON map asset (countries with
// `districts.source === 'map'`), using the same property names as the map rendering.
// Shared by the ridings API and the seed script, so it only uses relative imports and Node
// built-ins (the seed script runs outside Next.js).
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getElectionCountry } from '../../config/electionCountries.js';

function firstPresent(properties, names = []) {
	for (const name of names) {
		const value = properties?.[name];
		if (value !== undefined && value !== null && value !== '') return value;
	}
	return null;
}

async function readTopoDistricts(map) {
	const assetPath = path.join(process.cwd(), ...map.asset.split('/').filter(Boolean));
	const parsed = JSON.parse(await readFile(assetPath, 'utf8'));
	// TopoJSON (first object's geometries) or a plain GeoJSON FeatureCollection.
	let items = null;
	if (Array.isArray(parsed?.features)) {
		items = parsed.features;
	} else {
		const objectName = Object.keys(parsed?.objects ?? {})[0];
		items = objectName ? parsed?.objects?.[objectName]?.geometries : null;
	}
	if (!Array.isArray(items) || items.length === 0) return [];

	return items
		.map((geometry) => {
			const properties = geometry?.properties;
			const code = firstPresent(properties, map.idProperties);
			if (code === null) return null;
			const name = firstPresent(properties, map.nameProperties);
			const subnational = firstPresent(properties, map.subnationalProperties);
			return {
				code: String(code),
				name: name ? String(name) : String(code),
				subnational: subnational ? String(subnational) : ''
			};
		})
		.filter(Boolean);
}

const cache = new Map();

/**
 * Districts ({ code, name, subnational }) of a country whose districts come from its TopoJSON map,
 * or null for other countries. Cached per process; a failed read is not cached.
 */
export async function getTopoDistricts(countryCode) {
	const country = getElectionCountry(countryCode);
	if (country?.districts?.source !== 'map') return null;
	if (!cache.has(country.code)) {
		cache.set(
			country.code,
			readTopoDistricts(country.map).catch((error) => {
				cache.delete(country.code);
				throw error;
			})
		);
	}
	return cache.get(country.code);
}
