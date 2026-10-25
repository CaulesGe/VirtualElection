/**
 * Map adapter for a country rendered from a PMTiles vector tile file by PmtilesMap (one feature
 * per district in `sourceLayer`, carrying a `code` property).
 *
 * @param {string} countryCode e.g. "AU"
 * @param {Object} map the country's `map` config (`renderer: 'maplibre'`):
 *   `asset`, `sourceLayer`, `nameProperty`, `view` ({ bounds: [[minLon, minLat], [maxLon, maxLat]],
 *   center: [lat, lon], zoom, minZoom, maxZoom })
 * @param {Object[]} divisions committed division list ({ code, name, state, bbox })
 */
export function createPmtilesAdapter(countryCode, map, divisions) {
	return {
		countryCode,
		renderer: 'maplibre',
		sourceLayer: map.sourceLayer,
		divisions: divisions ?? [],
		getAssetUrl: () => map.asset,
		toGeoJSON: () => null,
		getDistrictId: (featureLike) => {
			const code = featureLike?.properties?.code;
			return code ? String(code) : null;
		},
		getDistrictName: (featureLike) => {
			const name = featureLike?.properties?.[map.nameProperty];
			return name ? String(name) : 'Unknown District';
		},
		getDefaultView: () => map.view
	};
}
