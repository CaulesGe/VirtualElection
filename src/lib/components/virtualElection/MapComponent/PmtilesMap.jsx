'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';

const SOURCE_ID = 'divisions';
const FILL_LAYER_ID = 'division-fill';
const LINE_LAYER_ID = 'division-line';
const SELECTED_LAYER_ID = 'division-selected';
const DEFAULT_FILL = '#d1d5db';
const DEFAULT_OPACITY = 0.35;
const HIGHLIGHT_OPACITY = 0.9;

let protocolRegistered = false;

/**
 * Vector-tile map (PMTiles + MapLibre GL) shared by every country whose adapter has
 * `renderer: 'maplibre'` (Australia, Germany). The adapter supplies the PMTiles URL, the
 * vector layer name (`sourceLayer`, features carry a `code` and `name`), the default view and
 * the `divisions` list ({ code, name, bbox }) used for search and zooming.
 * Same prop contract as VirtualElectionMap so MapController can swap between them.
 */
export default function PmtilesMap({
	adapter,
	districtStyles,
	districtTooltipMeta,
	selectedDistrictId,
	zoomToDistrictId,
	onZoomComplete,
	onHoverDistrict,
	onLeaveDistrict,
	onSelectDistrict,
	onFeaturesLoaded
}) {
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	const tooltipRef = useRef(null);
	const hoverIdRef = useRef(null);
	const selectedIdRef = useRef(null);
	const handlersRef = useRef({});
	const [isMapReady, setIsMapReady] = useState(false);
	const [loadError, setLoadError] = useState('');

	const selectedDistrict = selectedDistrictId ? String(selectedDistrictId) : '';
	const styleMap = useMemo(() => districtStyles ?? new Map(), [districtStyles]);
	const tooltipMetaMap = useMemo(() => districtTooltipMeta ?? new Map(), [districtTooltipMeta]);
	const sourceLayer = adapter.sourceLayer;
	const divisions = useMemo(() => adapter.divisions ?? [], [adapter]);
	const bboxByCode = useMemo(
		() => new Map(divisions.map((division) => [String(division.code), division.bbox])),
		[divisions]
	);
	const districtList = useMemo(
		() => divisions.map((division) => ({ code: division.code, name: division.name })),
		[divisions]
	);

	// Keep the latest props available to long-lived map event handlers.
	useEffect(() => {
		handlersRef.current = {
			selectedDistrict,
			tooltipMetaMap,
			onHoverDistrict,
			onLeaveDistrict,
			onSelectDistrict
		};
	});

	useEffect(() => {
		onFeaturesLoaded?.(districtList);
	}, [onFeaturesLoaded, districtList]);

	// Tooltip element (same look as the Leaflet maps).
	useEffect(() => {
		const tooltip = document.createElement('div');
		tooltip.style.position = 'fixed';
		tooltip.style.pointerEvents = 'none';
		tooltip.style.zIndex = '9000';
		tooltip.style.display = 'none';
		tooltip.style.background = 'rgba(255,255,255,0.97)';
		tooltip.style.border = '1px solid #888';
		tooltip.style.borderRadius = '6px';
		tooltip.style.padding = '8px 10px';
		tooltip.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
		document.body.appendChild(tooltip);
		tooltipRef.current = tooltip;
		return () => {
			tooltip.remove();
			tooltipRef.current = null;
		};
	}, []);

	// Map initialisation.
	useEffect(() => {
		let mounted = true;
		let map = null;

		function hideTooltip() {
			if (tooltipRef.current) tooltipRef.current.style.display = 'none';
		}

		function showTooltip(originalEvent, districtId, districtName) {
			const tooltip = tooltipRef.current;
			if (!tooltip) return;
			const meta = handlersRef.current.tooltipMetaMap?.get(String(districtId));
			const totalVotes = Number(meta?.totalVotes ?? 0);

			// Safe DOM construction (no innerHTML).
			tooltip.textContent = '';
			const nameEl = document.createElement('div');
			const strong = document.createElement('strong');
			strong.textContent = meta?.name || districtName || '';
			nameEl.appendChild(strong);
			tooltip.appendChild(nameEl);
			const votesEl = document.createElement('div');
			votesEl.textContent = totalVotes > 0 ? `${totalVotes} votes` : 'No votes yet';
			tooltip.appendChild(votesEl);

			tooltip.style.display = 'block';
			tooltip.style.left = `${originalEvent.clientX + 12}px`;
			tooltip.style.top = `${originalEvent.clientY - 16}px`;
		}

		function setHover(id, hovering) {
			if (!map || !id) return;
			map.setFeatureState({ source: SOURCE_ID, sourceLayer, id }, { hover: hovering });
		}

		async function initMap() {
			try {
				const maplibreModule = await import('maplibre-gl');
				if (!mounted || !containerRef.current || mapRef.current) return;
				const maplibregl = maplibreModule.default ?? maplibreModule;

				if (!protocolRegistered) {
					// The worker bundle is copied to public/ by scripts/copy-maplibre-worker.mjs because
					// MapLibre cannot locate it next to the bundled Next.js chunks.
					maplibregl.setWorkerUrl(`${window.location.origin}/maplibre/maplibre-gl-worker.mjs`);
					const protocol = new Protocol();
					maplibregl.addProtocol('pmtiles', protocol.tile);
					protocolRegistered = true;
				}

				const view = adapter.getDefaultView();
				const assetUrl = new URL(adapter.getAssetUrl(), window.location.origin).toString();

				map = new maplibregl.Map({
					container: containerRef.current,
					style: {
						version: 8,
						sources: {
							osm: {
								type: 'raster',
								tiles: [
									'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
									'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
									'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
								],
								tileSize: 256,
								maxzoom: 19,
								attribution: '© OpenStreetMap'
							},
							[SOURCE_ID]: {
								type: 'vector',
								url: `pmtiles://${assetUrl}`,
								promoteId: { [sourceLayer]: 'code' }
							}
						},
						layers: [
							{ id: 'osm', type: 'raster', source: 'osm' },
							{
								id: FILL_LAYER_ID,
								type: 'fill',
								source: SOURCE_ID,
								'source-layer': sourceLayer,
								paint: {
									'fill-color': ['coalesce', ['feature-state', 'fill'], DEFAULT_FILL],
									'fill-opacity': [
										'case',
										['boolean', ['feature-state', 'selected'], false],
										HIGHLIGHT_OPACITY,
										['boolean', ['feature-state', 'hover'], false],
										HIGHLIGHT_OPACITY,
										['coalesce', ['feature-state', 'opacity'], DEFAULT_OPACITY]
									]
								}
							},
							{
								id: LINE_LAYER_ID,
								type: 'line',
								source: SOURCE_ID,
								'source-layer': sourceLayer,
								paint: { 'line-color': '#4b5563', 'line-width': 0.6 }
							},
							{
								id: SELECTED_LAYER_ID,
								type: 'line',
								source: SOURCE_ID,
								'source-layer': sourceLayer,
								filter: ['==', ['get', 'code'], ''],
								paint: { 'line-color': '#111827', 'line-width': 2 }
							}
						]
					},
					bounds: view.bounds,
					fitBoundsOptions: { padding: 16 },
					minZoom: view.minZoom,
					maxZoom: view.maxZoom,
					dragRotate: false,
					attributionControl: { compact: true }
				});
				map.touchZoomRotate.disableRotation();
				map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

				map.on('error', (event) => {
					// Only surface failures of the division tiles; basemap tile errors are not fatal.
					const message = event?.error?.message;
					if (message && event?.sourceId === SOURCE_ID && mounted) {
						setLoadError(`Failed to load map: ${message}`);
					}
				});

				map.on('mousemove', FILL_LAYER_ID, (event) => {
					const feature = event.features?.[0];
					if (!feature) return;
					const id = String(feature.properties?.code ?? '');
					if (!id) return;
					const name = adapter.getDistrictName(feature);
					const locked = Boolean(handlersRef.current.selectedDistrict);
					map.getCanvas().style.cursor = 'pointer';

					if (hoverIdRef.current !== id) {
						setHover(hoverIdRef.current, false);
						hoverIdRef.current = id;
						if (!locked) {
							setHover(id, true);
							handlersRef.current.onHoverDistrict?.({
								districtId: id,
								districtName: name ? String(name) : ''
							});
						}
					}
					showTooltip(event.originalEvent, id, name ? String(name) : '');
				});

				map.on('mouseleave', FILL_LAYER_ID, () => {
					map.getCanvas().style.cursor = '';
					setHover(hoverIdRef.current, false);
					hoverIdRef.current = null;
					hideTooltip();
					if (!handlersRef.current.selectedDistrict) handlersRef.current.onLeaveDistrict?.();
				});

				map.on('click', FILL_LAYER_ID, (event) => {
					const feature = event.features?.[0];
					const id = String(feature?.properties?.code ?? '');
					if (!id) return;
					const name = adapter.getDistrictName(feature);
					// The parent toggles: selecting the already selected division deselects it.
					handlersRef.current.onSelectDistrict?.({
						districtId: id,
						districtName: name ? String(name) : ''
					});
					showTooltip(event.originalEvent, id, name ? String(name) : '');
				});

				map.on('movestart', hideTooltip);

				map.on('load', () => {
					if (!mounted) return;
					mapRef.current = map;
					setIsMapReady(true);
				});
			} catch (error) {
				if (mounted) {
					setLoadError(error instanceof Error ? error.message : 'Failed to load map');
				}
			}
		}

		void initMap();
		return () => {
			mounted = false;
			hoverIdRef.current = null;
			selectedIdRef.current = null;
			if (map) {
				map.remove();
				map = null;
			}
			mapRef.current = null;
			setIsMapReady(false);
		};
	}, [adapter, sourceLayer]);

	// Division colors (leader party and intensity) via feature-state.
	useEffect(() => {
		const map = mapRef.current;
		if (!isMapReady || !map) return;
		for (const division of divisions) {
			const style = styleMap.get(String(division.code));
			map.setFeatureState(
				{ source: SOURCE_ID, sourceLayer, id: String(division.code) },
				{
					fill: style?.fill ?? DEFAULT_FILL,
					opacity: style?.fillOpacity ?? DEFAULT_OPACITY
				}
			);
		}
	}, [isMapReady, styleMap, sourceLayer, divisions]);

	// Selected division highlight.
	useEffect(() => {
		const map = mapRef.current;
		if (!isMapReady || !map) return;
		const previous = selectedIdRef.current;
		if (previous && previous !== selectedDistrict) {
			map.setFeatureState({ source: SOURCE_ID, sourceLayer, id: previous }, { selected: false });
		}
		if (selectedDistrict) {
			map.setFeatureState({ source: SOURCE_ID, sourceLayer, id: selectedDistrict }, { selected: true });
		}
		map.setFilter(SELECTED_LAYER_ID, ['==', ['get', 'code'], selectedDistrict]);
		selectedIdRef.current = selectedDistrict || null;
	}, [isMapReady, selectedDistrict, sourceLayer]);

	// Zoom to a division (search selection).
	useEffect(() => {
		const map = mapRef.current;
		if (!zoomToDistrictId || !isMapReady || !map) return;
		const bbox = bboxByCode.get(String(zoomToDistrictId));
		if (Array.isArray(bbox) && bbox.length === 4) {
			map.fitBounds(
				[
					[bbox[0], bbox[1]],
					[bbox[2], bbox[3]]
				],
				{ padding: 40, maxZoom: 12, duration: 600 }
			);
		}
		onZoomComplete?.();
	}, [zoomToDistrictId, isMapReady, onZoomComplete, bboxByCode]);

	return (
		<div className="election-map-root">
			<div ref={containerRef} className="election-map-container" />
			{loadError ? <p className="error">{loadError}</p> : null}
		</div>
	);
}
