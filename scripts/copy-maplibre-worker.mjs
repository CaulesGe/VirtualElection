/**
 * Copies the MapLibre GL web worker bundle into public/ so it can be served from this origin.
 *
 * MapLibre resolves its worker relative to the module URL, which does not work once the library
 * is bundled into Next.js chunks, so AustraliaMap calls setWorkerUrl('/maplibre/maplibre-gl-worker.mjs').
 * Runs automatically before `dev` and `build`; the output folder is git-ignored.
 */
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const source = path.join(process.cwd(), 'node_modules', 'maplibre-gl', 'dist', 'maplibre-gl-worker.mjs');
const targetDir = path.join(process.cwd(), 'public', 'maplibre');

await mkdir(targetDir, { recursive: true });
await copyFile(source, path.join(targetDir, 'maplibre-gl-worker.mjs'));
console.log('[maplibre] worker copied to public/maplibre/maplibre-gl-worker.mjs');
