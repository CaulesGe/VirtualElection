/**
 * Decode static/ridingMaps/Germany.pmtiles (vector layer "fed") and build/verify
 * src/lib/data/deDivisions.json (one entry per Bundestag constituency / Wahlkreis).
 *
 * Usage: node scripts/extract-de-divisions.mjs [--write | --check]
 *   (no flag)  print a summary of what the pmtiles contains
 *   --write    (re)generate src/lib/data/deDivisions.json from the pmtiles
 *   --check    verify the committed JSON matches the pmtiles (codes, names, states, bboxes)
 */
import { readFile, writeFile, open } from 'node:fs/promises';
import path from 'node:path';
import { PMTiles } from 'pmtiles';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader as Pbf } from 'pbf';

const LAYER = 'fed';
const TILE_ZOOM = 8;
const EXPECTED_CONSTITUENCIES = 299;
const EXPECTED_STATES = 16;
const PMTILES_PATH = path.join(process.cwd(), 'static', 'ridingMaps', 'Germany.pmtiles');
const DIVISIONS_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'deDivisions.json');

// LAND_NR (as stored in the tiles) -> state code and English label.
const STATES = {
	'01': { code: 'SH', label: 'Schleswig-Holstein' },
	'02': { code: 'HH', label: 'Hamburg' },
	'03': { code: 'NI', label: 'Lower Saxony' },
	'04': { code: 'HB', label: 'Bremen' },
	'05': { code: 'NW', label: 'North Rhine-Westphalia' },
	'06': { code: 'HE', label: 'Hesse' },
	'07': { code: 'RP', label: 'Rhineland-Palatinate' },
	'08': { code: 'BW', label: 'Baden-Württemberg' },
	'09': { code: 'BY', label: 'Bavaria' },
	'10': { code: 'SL', label: 'Saarland' },
	'11': { code: 'BE', label: 'Berlin' },
	'12': { code: 'BB', label: 'Brandenburg' },
	'13': { code: 'MV', label: 'Mecklenburg-Vorpommern' },
	'14': { code: 'SN', label: 'Saxony' },
	'15': { code: 'ST', label: 'Saxony-Anhalt' },
	'16': { code: 'TH', label: 'Thuringia' }
};

class NodeFileSource {
	constructor(filePath) {
		this.filePath = filePath;
	}
	getKey() {
		return this.filePath;
	}
	async getBytes(offset, length) {
		const handle = await open(this.filePath, 'r');
		try {
			const buffer = Buffer.alloc(length);
			await handle.read(buffer, 0, length, offset);
			return {
				data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
			};
		} finally {
			await handle.close();
		}
	}
}

function lonToTileX(lon, z) {
	return Math.floor(((lon + 180) / 360) * 2 ** z);
}

function latToTileY(lat, z) {
	const rad = (lat * Math.PI) / 180;
	return Math.floor((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * 2 ** z);
}

function round(value) {
	return Math.round(value * 10000) / 10000;
}

async function extract() {
	const archive = new PMTiles(new NodeFileSource(PMTILES_PATH));
	const header = await archive.getHeader();
	const minX = lonToTileX(header.minLon, TILE_ZOOM);
	const maxX = lonToTileX(header.maxLon, TILE_ZOOM);
	const minY = latToTileY(header.maxLat, TILE_ZOOM);
	const maxY = latToTileY(header.minLat, TILE_ZOOM);

	const byCode = new Map();
	for (let x = minX; x <= maxX; x += 1) {
		for (let y = minY; y <= maxY; y += 1) {
			const tile = await archive.getZxy(TILE_ZOOM, x, y);
			if (!tile?.data) continue;
			const vt = new VectorTile(new Pbf(new Uint8Array(tile.data)));
			const layer = vt.layers[LAYER];
			if (!layer) continue;
			for (let i = 0; i < layer.length; i += 1) {
				const feature = layer.feature(i);
				const code = String(feature.properties.code ?? feature.properties.WKR_NR ?? '');
				if (!code) continue;
				const entry = byCode.get(code) ?? {
					code,
					name: String(feature.properties.WKR_NAME ?? code),
					landNr: String(feature.properties.LAND_NR ?? ''),
					landName: String(feature.properties.LAND_NAME ?? ''),
					bbox: null
				};
				const geojson = feature.toGeoJSON(x, y, TILE_ZOOM);
				const rings =
					geojson.geometry.type === 'Polygon'
						? geojson.geometry.coordinates
						: geojson.geometry.coordinates.flat();
				for (const ring of rings) {
					for (const [lon, lat] of ring) {
						entry.bbox = entry.bbox
							? [
									Math.min(entry.bbox[0], lon),
									Math.min(entry.bbox[1], lat),
									Math.max(entry.bbox[2], lon),
									Math.max(entry.bbox[3], lat)
								]
							: [lon, lat, lon, lat];
					}
				}
				byCode.set(code, entry);
			}
		}
	}

	return Array.from(byCode.values())
		.sort((a, b) => Number(a.code) - Number(b.code))
		.map((entry) => {
			const state = STATES[entry.landNr];
			return {
				code: entry.code,
				name: entry.name,
				state: state ? state.code : '',
				stateName: state ? state.label : entry.landName,
				bbox: entry.bbox ? entry.bbox.map(round) : null
			};
		});
}

function validate(divisions) {
	const problems = [];
	if (divisions.length !== EXPECTED_CONSTITUENCIES) {
		problems.push(`expected ${EXPECTED_CONSTITUENCIES} constituencies, found ${divisions.length}`);
	}
	const codes = new Set(divisions.map((division) => division.code));
	if (codes.size !== divisions.length) problems.push('duplicate constituency codes');
	const states = new Set(divisions.map((division) => division.state));
	if (states.has('')) problems.push('some constituencies have an unknown state (LAND_NR not mapped)');
	if (states.size !== EXPECTED_STATES) {
		problems.push(`expected ${EXPECTED_STATES} states, found ${states.size}`);
	}
	for (const division of divisions) {
		if (!Array.isArray(division.bbox) || division.bbox.some((value) => !Number.isFinite(value))) {
			problems.push(`constituency ${division.code} has no bbox`);
		}
	}
	return problems;
}

function summarize(divisions) {
	const perState = new Map();
	for (const division of divisions) {
		perState.set(division.state, (perState.get(division.state) ?? 0) + 1);
	}
	return Object.fromEntries(Array.from(perState.entries()).sort());
}

async function main() {
	const mode = process.argv[2] ?? '';
	const extracted = await extract();
	const problems = validate(extracted);

	if (mode === '--write') {
		if (problems.length > 0) {
			console.error('Refusing to write, tiles failed validation:', problems);
			process.exit(1);
		}
		await writeFile(DIVISIONS_PATH, `${JSON.stringify(extracted, null, '\t')}\n`, 'utf8');
		console.log(`Wrote ${extracted.length} constituencies to ${DIVISIONS_PATH}`);
		console.log('Per state:', summarize(extracted));
		return;
	}

	if (mode === '--check') {
		const committed = JSON.parse((await readFile(DIVISIONS_PATH, 'utf8')).replace(/^\uFEFF/, ''));
		const committedByCode = new Map(committed.map((division) => [division.code, division]));
		const checkProblems = [...problems];
		for (const division of extracted) {
			const existing = committedByCode.get(division.code);
			if (!existing) {
				checkProblems.push(`missing in JSON: ${division.code} ${division.name}`);
				continue;
			}
			if (existing.name !== division.name) {
				checkProblems.push(`name differs for ${division.code}: "${existing.name}" vs "${division.name}"`);
			}
			if (existing.state !== division.state) {
				checkProblems.push(`state differs for ${division.code}: ${existing.state} vs ${division.state}`);
			}
			if (JSON.stringify(existing.bbox) !== JSON.stringify(division.bbox)) {
				checkProblems.push(`bbox differs for ${division.code}`);
			}
		}
		for (const division of committed) {
			if (!extracted.some((item) => item.code === division.code)) {
				checkProblems.push(`in JSON but not in tiles: ${division.code}`);
			}
		}
		if (checkProblems.length > 0) {
			console.error('deDivisions.json check failed:');
			for (const problem of checkProblems) console.error(` - ${problem}`);
			process.exit(1);
		}
		console.log(`deDivisions.json matches Germany.pmtiles (${committed.length} constituencies).`);
		return;
	}

	console.log(`Found ${extracted.length} constituencies in layer "${LAYER}".`);
	console.log('Per state:', summarize(extracted));
	if (problems.length > 0) console.warn('Problems:', problems);
	console.log('First 3:', extracted.slice(0, 3));
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
