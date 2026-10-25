/**
 * One-off helper: decode static/ridingMaps/Austrilia.pmtiles and print every division
 * (code, name, approximate centroid). Used to build and verify src/lib/data/auDivisions.json.
 *
 * Usage: node scripts/extract-au-divisions.mjs [--check | --write-bbox]
 *   (no flag)     prints JSON of extracted divisions with approximate centroids and bboxes
 *   --check       compares src/lib/data/auDivisions.json to the pmtiles content and sanity-checks states
 *   --write-bbox  refreshes the zoom bbox of every division in auDivisions.json
 */
import { readFile, writeFile, open } from 'node:fs/promises';
import path from 'node:path';
import { PMTiles } from 'pmtiles';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader as Pbf } from 'pbf';

const TILE_ZOOM = 8;
// [minLon, minLat, maxLon, maxLat] of the Australian mainland plus Tasmania.
const MAINLAND_BOX = [112, -44.5, 154.5, -9];
const PMTILES_PATH = path.join(process.cwd(), 'static', 'ridingMaps', 'Austrilia.pmtiles');
const DIVISIONS_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'auDivisions.json');

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
	return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z);
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
			const layer = vt.layers['au-gen'];
			if (!layer) continue;
			for (let i = 0; i < layer.length; i += 1) {
				const feature = layer.feature(i);
				const code = String(feature.properties.code ?? '');
				if (!code) continue;
				const entry = byCode.get(code) ?? {
					code,
					name: String(feature.properties.name ?? code),
					sumLon: 0,
					sumLat: 0,
					count: 0,
					bbox: null
				};
				const geojson = feature.toGeoJSON(x, y, TILE_ZOOM);
				const rings =
					geojson.geometry.type === 'Polygon'
						? geojson.geometry.coordinates
						: geojson.geometry.coordinates.flat();
				for (const ring of rings) {
					let ringMinLon = Infinity;
					let ringMinLat = Infinity;
					let ringMaxLon = -Infinity;
					let ringMaxLat = -Infinity;
					for (const [lon, lat] of ring) {
						entry.sumLon += lon;
						entry.sumLat += lat;
						entry.count += 1;
						ringMinLon = Math.min(ringMinLon, lon);
						ringMinLat = Math.min(ringMinLat, lat);
						ringMaxLon = Math.max(ringMaxLon, lon);
						ringMaxLat = Math.max(ringMaxLat, lat);
					}
					// Only the Australian mainland and Tasmania contribute to the zoom bbox, so offshore
					// territories (Norfolk, Lord Howe, Christmas and Cocos Islands) do not stretch it.
					const centerLon = (ringMinLon + ringMaxLon) / 2;
					const centerLat = (ringMinLat + ringMaxLat) / 2;
					if (
						centerLon >= MAINLAND_BOX[0] &&
						centerLon <= MAINLAND_BOX[2] &&
						centerLat >= MAINLAND_BOX[1] &&
						centerLat <= MAINLAND_BOX[3]
					) {
						entry.bbox = entry.bbox
							? [
									Math.min(entry.bbox[0], ringMinLon),
									Math.min(entry.bbox[1], ringMinLat),
									Math.max(entry.bbox[2], ringMaxLon),
									Math.max(entry.bbox[3], ringMaxLat)
								]
							: [ringMinLon, ringMinLat, ringMaxLon, ringMaxLat];
					}
				}
				byCode.set(code, entry);
			}
		}
	}

	return Array.from(byCode.values())
		.map((entry) => ({
			code: entry.code,
			name: entry.name,
			lon: Number((entry.sumLon / entry.count).toFixed(3)),
			lat: Number((entry.sumLat / entry.count).toFixed(3)),
			bbox: entry.bbox ? entry.bbox.map((value) => Number(value.toFixed(3))) : null
		}))
		.sort((a, b) => a.code.localeCompare(b.code));
}

const OFFSHORE_EXEMPT = new Set(['BEAN', 'SYDNE']);

// Coarse sanity check of the state assignment (not used to assign states).
function looksLikeState(state, lon, lat) {
	switch (state) {
		case 'WA':
			return lon < 129.2;
		case 'NT':
			return lon >= 128.8 && lon <= 138.2 && lat > -26.1;
		case 'SA':
			return lon >= 128.8 && lon <= 141.2 && lat <= -25.9;
		case 'QLD':
			return lon >= 137.9 && lat > -29.3;
		case 'NSW':
			return lon >= 140.9 && lon <= 153.8 && lat < -28.0 && lat > -37.6;
		case 'ACT':
			return lon > 148.7 && lon < 150.2 && lat > -36.0 && lat < -35.0;
		case 'VIC':
			return lon >= 140.9 && lon <= 150.1 && lat <= -33.9 && lat >= -39.3;
		case 'TAS':
			return lon >= 143.5 && lon <= 148.6 && lat <= -39.4;
		default:
			return false;
	}
}

const extracted = await extract();

if (!process.argv.includes('--check') && !process.argv.includes('--write-bbox')) {
	console.log(JSON.stringify(extracted, null, 1));
	process.exit(0);
}

if (process.argv.includes('--write-bbox')) {
	// Adds/refreshes the zoom bbox of every division in auDivisions.json (states are kept as is).
	const existing = JSON.parse(await readFile(DIVISIONS_PATH, 'utf8'));
	const bboxByCode = new Map(extracted.map((item) => [item.code, item.bbox]));
	const next = existing.map((division) => ({
		code: division.code,
		name: division.name,
		state: division.state,
		bbox: bboxByCode.get(division.code) ?? null
	}));
	await writeFile(DIVISIONS_PATH, `${JSON.stringify(next, null, '\t')}\n`);
	console.log(`Wrote bbox for ${next.length} divisions.`);
	process.exit(0);
}

const divisions = JSON.parse(await readFile(DIVISIONS_PATH, 'utf8'));
const byCode = new Map(divisions.map((division) => [division.code, division]));
let problems = 0;

if (extracted.length !== 150) {
	console.error(`Expected 150 divisions in pmtiles, found ${extracted.length}`);
	problems += 1;
}
if (divisions.length !== extracted.length) {
	console.error(`auDivisions.json has ${divisions.length}, pmtiles has ${extracted.length}`);
	problems += 1;
}
for (const item of extracted) {
	const division = byCode.get(item.code);
	if (!division) {
		console.error(`Missing in auDivisions.json: ${item.code} ${item.name}`);
		problems += 1;
		continue;
	}
	if (!Array.isArray(division.bbox) || division.bbox.length !== 4) {
		console.error(`Missing bbox for ${item.code}; run with --write-bbox`);
		problems += 1;
	}
	if (division.name !== item.name) {
		console.error(`Name mismatch for ${item.code}: json="${division.name}" tiles="${item.name}"`);
		problems += 1;
	}
	// Divisions that include far offshore territories (Norfolk Island, Lord Howe Island) skew the centroid.
	if (!OFFSHORE_EXEMPT.has(item.code) && !looksLikeState(division.state, item.lon, item.lat)) {
		console.error(
			`State looks wrong: ${item.code} ${item.name} -> ${division.state} (centroid ${item.lon}, ${item.lat})`
		);
		problems += 1;
	}
}

const stateCounts = {};
for (const division of divisions) {
	stateCounts[division.state] = (stateCounts[division.state] ?? 0) + 1;
}
console.log('State counts:', stateCounts);
if (problems > 0) {
	console.error(`${problems} problem(s) found.`);
	process.exit(1);
}
console.log('auDivisions.json matches pmtiles (150 divisions).');
