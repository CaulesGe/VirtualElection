import { feature } from 'topojson-client';

function getMapAssetPath() {
	return '/static/ridingMaps/UK.json';
}

export const ukMapAdapter = {
	countryCode: 'UK',
	getAssetUrl: () => getMapAssetPath(),
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
		const gss = featureLike?.properties?.GSScode;
		const code3 = featureLike?.properties?.['3CODE'];
		const name = featureLike?.properties?.Name;
		if (gss) return String(gss);
		if (code3) return String(code3);
		if (name) return String(name);
		return null;
	},
	getDistrictName: (featureLike) => {
		const name = featureLike?.properties?.Name;
		if (name) return String(name);
		const altName = featureLike?.properties?.AltName;
		if (altName) return String(altName);
		return 'Unknown District';
	},
	getDefaultView: () => ({
		center: [54.2, -2.8],
		zoom: 5.2,
		minZoom: 4,
		maxZoom: 18
	})
};
