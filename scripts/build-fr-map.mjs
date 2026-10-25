/**
 * Builds static/ridingMaps/France.json (the map the app loads) from the full-resolution
 * static/ridingMaps/France.geojson (567 circonscriptions, 12 MB):
 *   - overseas constituencies are moved into inset boxes in the Atlantic (west of Brittany), each
 *     fitted to its own box, so the whole country fits one map view (true positions span the globe)
 *   - geometry is simplified (Douglas-Peucker) and rounded to keep the file small
 *   - properties become { code, name, dept, deptName, region }
 *
 * Usage: node scripts/build-fr-map.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE = path.join(process.cwd(), 'static', 'ridingMaps', 'France.geojson');
const OUTPUT = path.join(process.cwd(), 'static', 'ridingMaps', 'France.json');
const TOLERANCE = 0.0025; // degrees (~250 m)
const DECIMALS = 4;
const MIN_RING_AREA = 3e-6; // square degrees; smaller islets are dropped

const REGIONS = {
	ARA: ['Auvergne-Rhône-Alpes', '01 03 07 15 26 38 42 43 63 69 73 74'],
	BFC: ['Bourgogne-Franche-Comté', '21 25 39 58 70 71 89 90'],
	BRE: ['Bretagne', '22 29 35 56'],
	CVL: ['Centre-Val de Loire', '18 28 36 37 41 45'],
	COR: ['Corse', '2A 2B'],
	GES: ['Grand Est', '08 10 51 52 54 55 57 67 68 88'],
	HDF: ['Hauts-de-France', '02 59 60 62 80'],
	IDF: ['Île-de-France', '75 77 78 91 92 93 94 95'],
	NOR: ['Normandie', '14 27 50 61 76'],
	NAQ: ['Nouvelle-Aquitaine', '16 17 19 23 24 33 40 47 64 79 86 87'],
	OCC: ['Occitanie', '09 11 12 30 31 32 34 46 48 65 66 81 82'],
	PDL: ['Pays de la Loire', '44 49 53 72 85'],
	PAC: ["Provence-Alpes-Côte d'Azur", '04 05 06 13 83 84'],
	OM: ['Outre-mer', '971 972 973 974 975 976 977 978 986 987 988']
};
export const REGION_LABELS = Object.fromEntries(
	Object.entries(REGIONS).map(([code, [label]]) => [code, label])
);
const REGION_BY_DEPT = Object.fromEntries(
	Object.entries(REGIONS).flatMap(([code, [, depts]]) =>
		depts.split(' ').map((dept) => [dept.padStart(3, '0'), code])
	)
);

const DEPARTMENTS = {
	'001': 'Ain', '002': 'Aisne', '003': 'Allier', '004': 'Alpes-de-Haute-Provence',
	'005': 'Hautes-Alpes', '006': 'Alpes-Maritimes', '007': 'Ardèche', '008': 'Ardennes',
	'009': 'Ariège', '010': 'Aube', '011': 'Aude', '012': 'Aveyron', '013': 'Bouches-du-Rhône',
	'014': 'Calvados', '015': 'Cantal', '016': 'Charente', '017': 'Charente-Maritime',
	'018': 'Cher', '019': 'Corrèze', '021': "Côte-d'Or", '022': "Côtes-d'Armor", '023': 'Creuse',
	'024': 'Dordogne', '025': 'Doubs', '026': 'Drôme', '027': 'Eure', '028': 'Eure-et-Loir',
	'029': 'Finistère', '02A': 'Corse-du-Sud', '02B': 'Haute-Corse', '030': 'Gard',
	'031': 'Haute-Garonne', '032': 'Gers', '033': 'Gironde', '034': 'Hérault',
	'035': 'Ille-et-Vilaine', '036': 'Indre', '037': 'Indre-et-Loire', '038': 'Isère',
	'039': 'Jura', '040': 'Landes', '041': 'Loir-et-Cher', '042': 'Loire', '043': 'Haute-Loire',
	'044': 'Loire-Atlantique', '045': 'Loiret', '046': 'Lot', '047': 'Lot-et-Garonne',
	'048': 'Lozère', '049': 'Maine-et-Loire', '050': 'Manche', '051': 'Marne',
	'052': 'Haute-Marne', '053': 'Mayenne', '054': 'Meurthe-et-Moselle', '055': 'Meuse',
	'056': 'Morbihan', '057': 'Moselle', '058': 'Nièvre', '059': 'Nord', '060': 'Oise',
	'061': 'Orne', '062': 'Pas-de-Calais', '063': 'Puy-de-Dôme', '064': 'Pyrénées-Atlantiques',
	'065': 'Hautes-Pyrénées', '066': 'Pyrénées-Orientales', '067': 'Bas-Rhin', '068': 'Haut-Rhin',
	'069': 'Rhône', '070': 'Haute-Saône', '071': 'Saône-et-Loire', '072': 'Sarthe',
	'073': 'Savoie', '074': 'Haute-Savoie', '075': 'Paris', '076': 'Seine-Maritime',
	'077': 'Seine-et-Marne', '078': 'Yvelines', '079': 'Deux-Sèvres', '080': 'Somme',
	'081': 'Tarn', '082': 'Tarn-et-Garonne', '083': 'Var', '084': 'Vaucluse', '085': 'Vendée',
	'086': 'Vienne', '087': 'Haute-Vienne', '088': 'Vosges', '089': 'Yonne',
	'090': 'Territoire de Belfort', '091': 'Essonne', '092': 'Hauts-de-Seine',
	'093': 'Seine-Saint-Denis', '094': 'Val-de-Marne', '095': "Val-d'Oise",
	'971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane', '974': 'La Réunion',
	'975': 'Saint-Pierre-et-Miquelon', '976': 'Mayotte', '977': 'Saint-Barthélemy',
	'978': 'Saint-Martin', '986': 'Wallis-et-Futuna', '987': 'Polynésie française',
	'988': 'Nouvelle-Calédonie'
};

// Inset boxes (lon/lat) for the overseas departments, in the Atlantic west of Brittany.
const INSET_ORDER = ['971', '972', '973', '974', '976', '975', '977', '978', '986', '987', '988'];
const INSET_COLS = [
	[-21, -17.9],
	[-17.5, -14.4],
	[-14, -10.9]
];
function insetBox(index) {
	const [west, east] = INSET_COLS[index % 3];
	const top = 50.6 - 3.2 * Math.floor(index / 3);
	return { west, east, south: top - 2.8, north: top };
}

function eachPosition(coordinates, visit) {
	if (typeof coordinates[0] === 'number') visit(coordinates);
	else coordinates.forEach((child) => eachPosition(child, visit));
}

function bboxOf(features) {
	const box = { west: 180, south: 90, east: -180, north: -90 };
	for (const feature of features) {
		eachPosition(feature.geometry.coordinates, ([lon, lat]) => {
			box.west = Math.min(box.west, lon);
			box.east = Math.max(box.east, lon);
			box.south = Math.min(box.south, lat);
			box.north = Math.max(box.north, lat);
		});
	}
	return box;
}

// Shape-preserving move of a department into its box (equirectangular fit at both latitudes).
function createInsetTransform(features, box) {
	const source = bboxOf(features);
	const lon0 = (source.west + source.east) / 2;
	const lat0 = (source.south + source.north) / 2;
	const targetLon = (box.west + box.east) / 2;
	const targetLat = (box.south + box.north) / 2;
	const cosSource = Math.cos((lat0 * Math.PI) / 180);
	const cosTarget = Math.cos((targetLat * Math.PI) / 180);
	const sourceWidth = (source.east - source.west) * cosSource;
	const sourceHeight = source.north - source.south;
	const scale = Math.min(
		((box.east - box.west) * cosTarget) / sourceWidth,
		(box.north - box.south) / sourceHeight
	);
	return ([lon, lat]) => [
		targetLon + (((lon - lon0) * cosSource) * scale) / cosTarget,
		targetLat + (lat - lat0) * scale
	];
}

function ringArea(ring) {
	let area = 0;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		area += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
	}
	return Math.abs(area) / 2;
}

function simplifyLine(points, tolerance) {
	const keep = new Uint8Array(points.length);
	keep[0] = keep[points.length - 1] = 1;
	const stack = [[0, points.length - 1]];
	const squared = tolerance * tolerance;
	while (stack.length) {
		const [start, end] = stack.pop();
		const [ax, ay] = points[start];
		const [bx, by] = points[end];
		const dx = bx - ax;
		const dy = by - ay;
		const lengthSquared = dx * dx + dy * dy;
		let maxDistance = 0;
		let index = -1;
		for (let i = start + 1; i < end; i++) {
			const [px, py] = points[i];
			let distance;
			if (lengthSquared === 0) {
				distance = (px - ax) ** 2 + (py - ay) ** 2;
			} else {
				const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
				distance = (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2;
			}
			if (distance > maxDistance) {
				maxDistance = distance;
				index = i;
			}
		}
		if (maxDistance > squared && index !== -1) {
			keep[index] = 1;
			stack.push([start, index], [index, end]);
		}
	}
	return points.filter((_, i) => keep[i]);
}

function round(value) {
	return Number(value.toFixed(DECIMALS));
}

function simplifyRing(ring) {
	// Closed ring: split in two halves so the anchor points stay stable.
	const open = ring.slice(0, -1);
	const middle = Math.floor(open.length / 2);
	const first = simplifyLine(open.slice(0, middle + 1), TOLERANCE);
	const second = simplifyLine([...open.slice(middle), open[0]], TOLERANCE);
	const simplified = [...first, ...second.slice(1)].map(([x, y]) => [round(x), round(y)]);
	return simplified.length >= 4 ? simplified : null;
}

function simplifyGeometry(geometry) {
	const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
	const largest = polygons.reduce((best, polygon) =>
		ringArea(polygon[0]) > ringArea(best[0]) ? polygon : best
	);
	const result = [];
	for (const polygon of polygons) {
		if (polygon !== largest && ringArea(polygon[0]) < MIN_RING_AREA) continue;
		const outer = simplifyRing(polygon[0]);
		if (!outer) continue;
		const holes = polygon
			.slice(1)
			.filter((hole) => ringArea(hole) >= MIN_RING_AREA)
			.map(simplifyRing)
			.filter(Boolean);
		result.push([outer, ...holes]);
	}
	return result.length === 1
		? { type: 'Polygon', coordinates: result[0] }
		: { type: 'MultiPolygon', coordinates: result };
}

function mapCoordinates(coordinates, fn) {
	return typeof coordinates[0] === 'number'
		? fn(coordinates)
		: coordinates.map((child) => mapCoordinates(child, fn));
}

function ordinal(n) {
	return n === 1 ? '1re' : `${n}e`;
}

async function main() {
	const source = JSON.parse(await readFile(SOURCE, 'utf8'));
	const byDept = new Map();
	for (const feature of source.features) {
		const dept = feature.properties.dept;
		if (!byDept.has(dept)) byDept.set(dept, []);
		byDept.get(dept).push(feature);
	}

	const transforms = new Map();
	INSET_ORDER.forEach((dept, index) => {
		const features = byDept.get(dept);
		if (!features) throw new Error(`Missing overseas department ${dept}`);
		transforms.set(dept, createInsetTransform(features, insetBox(index)));
	});

	const features = source.features.map((feature) => {
		const { dept, circ, circ_id: code } = feature.properties;
		const deptName = DEPARTMENTS[dept];
		const region = REGION_BY_DEPT[dept];
		if (!deptName || !region) throw new Error(`Unknown department ${dept}`);
		const transform = transforms.get(dept);
		const moved = transform
			? { ...feature.geometry, coordinates: mapCoordinates(feature.geometry.coordinates, transform) }
			: feature.geometry;
		return {
			type: 'Feature',
			properties: {
				code,
				name: `${deptName}, ${ordinal(Number(circ))} circonscription`,
				dept,
				deptName,
				region
			},
			geometry: simplifyGeometry(moved)
		};
	});

	const text = JSON.stringify({ type: 'FeatureCollection', features });
	await writeFile(OUTPUT, text);
	console.log(
		`${features.length} circonscriptions -> ${path.relative(process.cwd(), OUTPUT)} (${(text.length / 1048576).toFixed(2)} MB)`
	);
}

await main();
