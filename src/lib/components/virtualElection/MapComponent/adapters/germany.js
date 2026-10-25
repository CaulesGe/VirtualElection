import deDivisions from '@/lib/data/deDivisions.json';

function getMapAssetPath() {
	return '/static/ridingMaps/Germany.pmtiles';
}

// Germany is rendered from vector tiles (PMTiles, layer "fed", one feature per Bundestag
// constituency) by PmtilesMap, so there is no GeoJSON conversion step like Canada or the UK.
export const germanyMapAdapter = {
	countryCode: 'DE',
	renderer: 'maplibre',
	sourceLayer: 'fed',
	divisions: deDivisions,
	getAssetUrl: () => getMapAssetPath(),
	toGeoJSON: () => null,
	getDistrictId: (featureLike) => {
		const code = featureLike?.properties?.code;
		return code ? String(code) : null;
	},
	getDistrictName: (featureLike) => {
		const name = featureLike?.properties?.WKR_NAME;
		return name ? String(name) : 'Unknown District';
	},
	getDefaultView: () => ({
		// [minLon, minLat, maxLon, maxLat] framing Germany.
		bounds: [
			[5.5, 47.1],
			[15.4, 55.2]
		],
		center: [51.2, 10.4],
		zoom: 5,
		minZoom: 4,
		maxZoom: 14
	})
};
