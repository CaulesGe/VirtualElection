/**
 * @typedef {Object} MapAdapter
 * @property {string} countryCode
 * @property {(mapVersion: string) => string} getAssetUrl
 * @property {(raw: unknown) => import("geojson").FeatureCollection | null} toGeoJSON
 * @property {(feature: import("geojson").Feature) => string | null} getDistrictId
 * @property {(feature: import("geojson").Feature) => string} getDistrictName
 * @property {() => { center: [number, number], zoom: number, minZoom?: number, maxZoom?: number }} getDefaultView
 */

export function assertMapAdapter(adapter) {
	if (!adapter) throw new Error("Missing map adapter");
	const required = [
		"countryCode",
		"getAssetUrl",
		"toGeoJSON",
		"getDistrictId",
		"getDistrictName",
		"getDefaultView"
	];
	for (const key of required) {
		if (!(key in adapter)) {
			throw new Error(`Invalid map adapter: missing ${key}`);
		}
	}
	return adapter;
}
