import { feature } from "topojson-client";

function getMapAssetPath(mapVersion) {
	if (String(mapVersion) === "2025") {
		return "/static/ridingMaps/canada2025.json";
	}
	return "/static/ridingMaps/canada2025.json";
}

export const canadaMapAdapter = {
	countryCode: "CA",
	getAssetUrl: (mapVersion) => getMapAssetPath(mapVersion),
	toGeoJSON: (raw) => {
		if (!raw || typeof raw !== "object") return null;
		if (raw.type === "FeatureCollection" && Array.isArray(raw.features)) {
			return raw;
		}
		if (raw.type === "Topology" && raw.objects) {
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
		const value = featureLike?.properties?.FED_NUM;
		if (value === undefined || value === null) return null;
		return String(value);
	},
	getDistrictName: (featureLike) => {
		const name = featureLike?.properties?.ED_NAMEE;
		return name ? String(name) : "Unknown District";
	},
	getDefaultView: () => ({
		center: [56, -96],
		zoom: 3.6,
		minZoom: 3,
		maxZoom: 18
	})
};
