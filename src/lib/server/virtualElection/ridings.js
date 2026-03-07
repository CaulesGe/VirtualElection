import { and, eq, sql } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_RIDINGS } from '@/lib/data/defaultRidings';
import { db } from '@/lib/server/db/client';
import {
	constituencies,
	countries,
	electionDistricts,
	elections,
	jurisdictions
} from '@/lib/server/db/schema';
import { getUsRidingsForScope } from '@/lib/server/virtualElection/usRidings';

let canadaMapRidingsPromise = null;
let ukMapRidingsPromise = null;

function dedupeRidingsByCode(rows) {
	const byCode = new Map();
	for (const row of rows ?? []) {
		const code = String(row?.code ?? '').trim();
		if (!code) continue;
		if (!byCode.has(code)) {
			byCode.set(code, {
				code,
				name: row?.name ? String(row.name) : code,
				subnational: row?.subnational ? String(row.subnational) : '',
				electoralVotes: row?.electoralVotes ?? null
			});
		}
	}
	return Array.from(byCode.values());
}

async function readCanadaRidingsFromMapAsset() {
	const assetPath = path.join(process.cwd(), 'static', 'ridingMaps', 'canada2025.json');
	const raw = await readFile(assetPath, 'utf8');
	const parsed = JSON.parse(raw);
	const objectName = Object.keys(parsed?.objects ?? {})[0];
	const geometries = objectName ? parsed?.objects?.[objectName]?.geometries : null;
	if (!Array.isArray(geometries) || geometries.length === 0) {
		return [];
	}

	return dedupeRidingsByCode(
		geometries
		.map((geometry) => ({
			code: geometry?.properties?.FED_NUM,
			name: geometry?.properties?.ED_NAMEE
		}))
		.filter((row) => row.code !== undefined && row.code !== null)
		.map((row) => ({
			code: String(row.code),
			name: row.name ? String(row.name) : String(row.code),
			subnational: ''
		}))
	);
}

async function getCanadaMapRidings() {
	if (!canadaMapRidingsPromise) {
		canadaMapRidingsPromise = readCanadaRidingsFromMapAsset().catch((error) => {
			canadaMapRidingsPromise = null;
			throw error;
		});
	}
	return canadaMapRidingsPromise;
}

async function readUkRidingsFromMapAsset() {
	const assetPath = path.join(process.cwd(), 'static', 'ridingMaps', 'UK.json');
	const raw = await readFile(assetPath, 'utf8');
	const parsed = JSON.parse(raw);
	const objectName = Object.keys(parsed?.objects ?? {})[0];
	const geometries = objectName ? parsed?.objects?.[objectName]?.geometries : null;
	if (!Array.isArray(geometries) || geometries.length === 0) {
		return [];
	}

	return dedupeRidingsByCode(
		geometries
		.map((geometry) => ({
			code: geometry?.properties?.GSScode ?? geometry?.properties?.['3CODE'],
			name: geometry?.properties?.Name,
			subnational: geometry?.properties?.CTR_REG ?? geometry?.properties?.Country
		}))
		.filter((row) => row.code !== undefined && row.code !== null)
		.map((row) => ({
			code: String(row.code),
			name: row.name ? String(row.name) : String(row.code),
			subnational: row.subnational ? String(row.subnational) : ''
		}))
	);
}

async function getUkMapRidings() {
	if (!ukMapRidingsPromise) {
		ukMapRidingsPromise = readUkRidingsFromMapAsset().catch((error) => {
			ukMapRidingsPromise = null;
			throw error;
		});
	}
	return ukMapRidingsPromise;
}

export async function getRidingsForScope(scope) {
	try {
		const scopedDistricts = await db
			.select({
				code: electionDistricts.districtKey,
				name: electionDistricts.name,
				subnational: electionDistricts.subnationalCode,
				electoralVotes: electionDistricts.electoralVotes
			})
			.from(electionDistricts)
			.innerJoin(elections, eq(elections.id, electionDistricts.electionId))
			.where(
				and(
					eq(elections.scopeCountry, scope.country),
					eq(elections.scopeDistrict, scope.district),
					eq(elections.scopeYear, scope.year),
					eq(elections.status, 'active')
				)
			);
		if (scopedDistricts.length > 0) {
			return dedupeRidingsByCode(
				scopedDistricts.map((row) => ({
				code: String(row.code),
				name: row.name || String(row.code),
				subnational: row.subnational || '',
				electoralVotes: row.electoralVotes ?? null
			}))
			);
		}
	} catch {
		// Continue into legacy source fallback.
	}

	if (String(scope?.country).toLowerCase() === 'us') {
		if (String(scope?.district).toLowerCase() === 'pres') {
			return [];
		}
		try {
			return await getUsRidingsForScope(scope);
		} catch {
			return [];
		}
	}

	if (
		String(scope?.country).toLowerCase() === 'ca' &&
		String(scope?.district).toLowerCase() === 'fed'
	) {
		try {
			const mapRidings = await getCanadaMapRidings();
			if (mapRidings.length > 0) return mapRidings;
		} catch {
			// Continue into legacy source fallback.
		}
	}

	if (
		String(scope?.country).toLowerCase() === 'uk' &&
		String(scope?.district).toLowerCase() === 'fed'
	) {
		try {
			const mapRidings = await getUkMapRidings();
			if (mapRidings.length > 0) return mapRidings;
		} catch {
			// Continue into legacy source fallback.
		}
	}

	try {
		const rows = await db
			.select({
				code: constituencies.code,
				name: constituencies.name,
				subnational: constituencies.subnational
			})
			.from(constituencies)
			.innerJoin(jurisdictions, eq(jurisdictions.id, constituencies.jurisdictionId))
			.innerJoin(countries, eq(countries.id, jurisdictions.countryId))
			.where(
				and(
					sql`lower(${countries.code}) = ${scope.country}`,
					sql`lower(${jurisdictions.code}) = ${scope.district}`
				)
			);

		if (!rows?.length) return DEFAULT_RIDINGS;
		return dedupeRidingsByCode(
			rows.map((row) => ({
			code: String(row.code),
			name: row.name || String(row.code),
			subnational: row.subnational || ''
		}))
		);
	} catch {
		return DEFAULT_RIDINGS;
	}
}
