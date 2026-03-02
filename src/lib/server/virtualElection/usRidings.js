import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getUsStateCodeFromFp, toUsDistrictKey, toUsDistrictLabel } from '@/lib/virtualElection/usDistricts';

let cachedRows = null;

async function readRawUsMap() {
	const mapPath = path.join(process.cwd(), 'static', 'ridingMaps', 'USA.json');
	const rawText = await fs.readFile(mapPath, 'utf8');
	return JSON.parse(rawText);
}

export async function getUsRidingsForScope(scope) {
	if (cachedRows) return cachedRows;

	const raw = await readRawUsMap();
	const objectName = Object.keys(raw?.objects ?? {})[0];
	const geometries = raw?.objects?.[objectName]?.geometries ?? [];
	const deduped = new Map();

	for (const geometry of geometries) {
		const props = geometry?.properties ?? {};
		const stateFp = props.STATEFP;
		const district = props.DISTRICT;
		const code = toUsDistrictKey({ stateFp, district, year: scope?.year ?? 2025 });
		if (!code) continue;
		if (deduped.has(code)) continue;

		const stateCode = getUsStateCodeFromFp(stateFp);
		const stateName = String(props.STATENAME ?? '').trim();
		const districtLabel = toUsDistrictLabel({ stateFp, district });

		deduped.set(code, {
			code,
			name: stateName ? `${stateName} ${districtLabel}` : districtLabel,
			subnational: stateCode
		});
	}

	cachedRows = Array.from(deduped.values()).sort((a, b) => a.code.localeCompare(b.code));
	return cachedRows;
}
