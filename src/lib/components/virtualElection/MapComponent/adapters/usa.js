import { feature } from 'topojson-client';
import { toUsDistrictKey, toUsDistrictLabel } from '@/lib/virtualElection/usDistricts';
import {
	normalizeStateFips,
	toUsPresidentDistrictKey,
	US_STATE_FIPS_METADATA
} from '@/lib/virtualElection/usPresidentStates';

function isPresidentMapVersion(mapVersion) {
	return String(mapVersion ?? '').toLowerCase().startsWith('pres-');
}

function getMapAssetPath(mapVersion) {
	if (isPresidentMapVersion(mapVersion)) {
		return '/static/ridingMaps/us-atlas-states-10m.json';
	}
	return '/static/ridingMaps/USA.json';
}

export const usaMapAdapter = {
	countryCode: 'US',
	getAssetUrl: (mapVersion) => getMapAssetPath(mapVersion),
	toGeoJSON: (raw) => {
		if (!raw || typeof raw !== 'object') return null;
		if (raw.type === 'FeatureCollection' && Array.isArray(raw.features)) {
			return raw;
		}
		if (raw.type === 'Topology' && raw.objects) {
			const firstObjectName = raw.objects.states ? 'states' : Object.keys(raw.objects)[0];
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
		const stateLikeId = normalizeStateFips(featureLike?.id);
		if (stateLikeId) {
			return toUsPresidentDistrictKey({ year: 2025, fips: stateLikeId });
		}
		const stateFp = featureLike?.properties?.STATEFP;
		const district = featureLike?.properties?.DISTRICT;
		const key = toUsDistrictKey({ stateFp, district, year: 2025 });
		return key || null;
	},
	getDistrictName: (featureLike) => {
		const stateLikeId = normalizeStateFips(featureLike?.id);
		if (stateLikeId) {
			const meta = US_STATE_FIPS_METADATA[stateLikeId];
			return meta?.name ?? `State ${stateLikeId}`;
		}
		const stateFp = featureLike?.properties?.STATEFP;
		const district = featureLike?.properties?.DISTRICT;
		const stateName = String(featureLike?.properties?.STATENAME ?? '').trim();
		const label = toUsDistrictLabel({ stateFp, district });
		return stateName ? `${stateName} ${label}` : label;
	},
	getDefaultView: () => ({
		center: [39.5, -98.35],
		zoom: 4,
		minZoom: 3,
		maxZoom: 18
	})
};
