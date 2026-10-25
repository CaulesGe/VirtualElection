import auDivisions from '@/lib/data/auDivisions.json';

function getMapAssetPath() {
	return '/static/ridingMaps/Austrilia.pmtiles';
}

// Australia is rendered from vector tiles (PMTiles, layer "au-gen") by PmtilesMap,
// so there is no GeoJSON conversion step like the other adapters.
export const australiaMapAdapter = {
	countryCode: 'AU',
	renderer: 'maplibre',
	sourceLayer: 'au-gen',
	divisions: auDivisions,
	getAssetUrl: () => getMapAssetPath(),
	toGeoJSON: () => null,
	getDistrictId: (featureLike) => {
		const code = featureLike?.properties?.code;
		return code ? String(code) : null;
	},
	getDistrictName: (featureLike) => {
		const name = featureLike?.properties?.name;
		return name ? String(name) : 'Unknown District';
	},
	getDefaultView: () => ({
		// [minLon, minLat, maxLon, maxLat] framing mainland Australia plus Tasmania.
		bounds: [
			[112.5, -44.5],
			[154.5, -10]
		],
		center: [-26, 134],
		zoom: 3,
		minZoom: 2,
		maxZoom: 14
	})
};
