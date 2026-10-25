import { feature } from 'topojson-client';

function firstPresent(properties, names = []) {
	for (const name of names) {
		const value = properties?.[name];
		if (value !== undefined && value !== null && value !== '') return value;
	}
	return null;
}

/**
 * Map adapter for a country rendered by the Leaflet/D3 map from a TopoJSON (or GeoJSON) file.
 *
 * @param {string} countryCode e.g. "UK"
 * @param {Object} map the country's `map` config (`renderer: 'leaflet'`): `asset`,
 *   `idProperties` / `nameProperties` (first present property wins), `view` ({ center, zoom,
 *   minZoom, maxZoom })
 */
export function createTopoJsonAdapter(countryCode, map) {
	return {
		countryCode,
		// /static/* is cached for a day (immutable): bump `assetVersion` when the file changes.
		getAssetUrl: () => (map.assetVersion ? `${map.asset}?v=${map.assetVersion}` : map.asset),
		toGeoJSON: (raw) => {
			if (!raw || typeof raw !== 'object') return null;
			if (raw.type === 'FeatureCollection' && Array.isArray(raw.features)) {
				return raw;
			}
			if (raw.type === 'Topology' && raw.objects) {
				const firstObjectName = Object.keys(raw.objects)[0];
				if (!firstObjectName) return null;
				try {
					return feature(raw, raw.objects[firstObjectName]);
				} catch {
					return null;
				}
			}
			return null;
		},
		getDistrictId: (featureLike) => {
			const value = firstPresent(featureLike?.properties, map.idProperties);
			return value === null ? null : String(value);
		},
		getDistrictName: (featureLike) => {
			const name = firstPresent(featureLike?.properties, map.nameProperties);
			return name ? String(name) : 'Unknown District';
		},
		getDefaultView: () => map.view
	};
}
