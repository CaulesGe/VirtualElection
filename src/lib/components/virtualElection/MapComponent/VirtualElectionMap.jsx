'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { geoPath, geoTransform } from 'd3-geo';

export default function VirtualElectionMap({
	adapter,
	mapVersion,
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
	const overlayRef = useRef(null);
	const groupRef = useRef(null);
	const pathRef = useRef(null);
	const leafletRef = useRef(null);
	const selectedFeatureRef = useRef(null);
	const isMapMovingRef = useRef(false);
	const tooltipRef = useRef(null);
	const [features, setFeatures] = useState([]);
	const [loadError, setLoadError] = useState('');
	const [isMapReady, setIsMapReady] = useState(false);

	const selectedDistrict = String(selectedDistrictId ?? '');
	const isSelectionLocked = Boolean(selectedDistrict);
	const styleMap = useMemo(() => districtStyles ?? new Map(), [districtStyles]);
	const tooltipMetaMap = useMemo(() => districtTooltipMeta ?? new Map(), [districtTooltipMeta]);

	useEffect(() => {
		let cancelled = false;
		async function loadFeatures() {
			setLoadError('');
			try {
				const response = await fetch(adapter.getAssetUrl(mapVersion));
				if (!response.ok) throw new Error('Failed to load map asset');
				const raw = await response.json();
				const geoJSON = adapter.toGeoJSON(raw);
				if (!geoJSON?.features?.length) throw new Error('Invalid map asset content');
				if (!cancelled) {
					setFeatures(geoJSON.features);
					if (typeof onFeaturesLoaded === 'function') {
						const districts = geoJSON.features
							.map((f) => {
								const id = adapter.getDistrictId(f);
								if (!id) return null;
								return { code: String(id), name: adapter.getDistrictName(f) };
							})
							.filter(Boolean);
						onFeaturesLoaded(districts);
					}
				}
			} catch (error) {
				if (!cancelled) {
					setFeatures([]);
					setLoadError(error instanceof Error ? error.message : 'Failed to load map');
				}
			}
		}
		void loadFeatures();
		return () => {
			cancelled = true;
		};
	}, [adapter, mapVersion, onFeaturesLoaded]);

	useEffect(() => {
		let mounted = true;
		let map;
		let redrawFrame = null;

		async function initMap() {
			const L = (await import('leaflet')).default;
			if (!mounted || !containerRef.current || mapRef.current) return;
			leafletRef.current = L;

			const { center, zoom, minZoom, maxZoom } = adapter.getDefaultView();
			map = L.map(containerRef.current, { zoomSnap: 0.25, minZoom, maxZoom, zoomControl: false }).setView(center, zoom);
			L.control.zoom({ position: 'bottomright' }).addTo(map);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap'
			}).addTo(map);
			L.svg().addTo(map);

			const overlaySvg = select(map.getPanes().overlayPane).select('svg');
			const group = overlaySvg.append('g').attr('class', 'election-districts');
			const projection = geoTransform({
				point(lon, lat) {
					const point = map.latLngToLayerPoint([lat, lon]);
					this.stream.point(point.x, point.y);
				}
			});
			const pathGenerator = geoPath().projection(projection);

			const redraw = () => {
				if (!groupRef.current || !pathRef.current) return;
				groupRef.current.selectAll('path.district').attr('d', (d) => pathRef.current(d));
			};
			const scheduleRedraw = () => {
				if (redrawFrame) cancelAnimationFrame(redrawFrame);
				redrawFrame = requestAnimationFrame(redraw);
			};

			const hideTooltip = () => {
				if (!tooltipRef.current) return;
				tooltipRef.current.style.display = 'none';
			};
			const setMapMoving = (moving) => {
				isMapMovingRef.current = moving;
				if (overlayRef.current) {
					overlayRef.current.style('pointer-events', moving ? 'none' : 'auto');
				}
				if (moving) hideTooltip();
			};

			map.on('movestart', () => setMapMoving(true));
			map.on('zoomstart', () => setMapMoving(true));
			map.on('moveend', scheduleRedraw);
			map.on('zoomend', scheduleRedraw);
			map.on('moveend', () => requestAnimationFrame(() => setMapMoving(false)));
			map.on('zoomend', () => requestAnimationFrame(() => setMapMoving(false)));

			mapRef.current = map;
			overlayRef.current = overlaySvg;
			groupRef.current = group;
			pathRef.current = pathGenerator;
			setIsMapReady(true);
		}

		void initMap();
		return () => {
			mounted = false;
			if (redrawFrame) cancelAnimationFrame(redrawFrame);
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
				overlayRef.current = null;
				groupRef.current = null;
				pathRef.current = null;
			}
			setIsMapReady(false);
		};
	}, [adapter]);

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

	useEffect(() => {
		if (!zoomToDistrictId || !mapRef.current || !features.length) return;
		const L = leafletRef.current;
		if (!L) return;
		const targetFeature = features.find(
			(f) => String(adapter.getDistrictId(f)) === String(zoomToDistrictId)
		);
		if (!targetFeature) {
			onZoomComplete?.();
			return;
		}
		try {
			const layer = L.geoJSON(targetFeature);
			const bounds = layer.getBounds();
			if (bounds.isValid()) {
				mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, animate: true });
			}
		} catch {
			// Ignore invalid geometry
		}
		onZoomComplete?.();
	}, [zoomToDistrictId, features, adapter, onZoomComplete]);

	useEffect(() => {
		if (!isMapReady || !groupRef.current || !pathRef.current) return;

		const getOpacity = (featureLike) => {
			const districtId = adapter.getDistrictId(featureLike);
			if (!districtId) return 0.35;
			return styleMap.get(String(districtId))?.fillOpacity ?? 0.35;
		};
		const hideTooltip = () => {
			if (!tooltipRef.current) return;
			tooltipRef.current.style.display = 'none';
		};
		const moveTooltip = (event) => {
			if (!tooltipRef.current) return;
			tooltipRef.current.style.left = `${event.clientX + 12}px`;
			tooltipRef.current.style.top = `${event.clientY - 16}px`;
		};
		const showTooltip = (event, featureLike) => {
			if (!tooltipRef.current) return;
			// Safe DOM construction — no innerHTML
			const tooltip = tooltipRef.current;
			tooltip.textContent = '';

			const districtId = adapter.getDistrictId(featureLike);
			const districtName = adapter.getDistrictName(featureLike);

			if (!districtId) {
				const nameDiv = document.createElement('div');
				nameDiv.textContent = districtName ?? '';
				tooltip.appendChild(nameDiv);
			} else {
				const meta = tooltipMetaMap.get(String(districtId));
				const name = meta?.name || districtName;
				const totalVotes = Number(meta?.totalVotes ?? 0);
				const ev = Number(meta?.electoralVotes ?? 0);

				const nameEl = document.createElement('div');
				const strong = document.createElement('strong');
				strong.textContent = name ?? '';
				nameEl.appendChild(strong);
				tooltip.appendChild(nameEl);

				if (ev > 0) {
					const evEl = document.createElement('div');
					evEl.textContent = `${ev} EV`;
					tooltip.appendChild(evEl);
				}

				const votesEl = document.createElement('div');
				votesEl.textContent = totalVotes > 0 ? `${totalVotes} votes` : 'No votes yet';
				tooltip.appendChild(votesEl);
			}

			tooltip.style.display = 'block';
			moveTooltip(event);
		};
		const resetFeatureStyle = (selection, featureLike) => {
			selection.attr('fill-opacity', getOpacity(featureLike)).attr('stroke-width', 0.6);
		};
		const highlightFeature = (selection) => {
			selection.attr('fill-opacity', 0.9).attr('stroke-width', 2);
		};
		const isTransitioningToAnotherDistrict = (event) => {
			const related = event?.relatedTarget;
			return Boolean(
				related &&
				typeof related.closest === 'function' &&
				related.closest('path.district')
			);
		};

		const paths = groupRef.current
			.selectAll('path.district')
			.data(features, (d) => adapter.getDistrictId(d) ?? Math.random())
			.join(
				(enter) =>
					enter
						.append('path')
						.attr('class', 'district leaflet-interactive')
						.attr('stroke', '#4b5563')
						.attr('stroke-width', 0.6)
						.style('pointer-events', 'auto')
						.attr('d', (d) => pathRef.current(d) || ''),
				(update) => update.attr('d', (d) => pathRef.current(d) || ''),
				(exit) => exit.remove()
			);

		paths
			.attr('fill', (d) => {
				const districtId = adapter.getDistrictId(d);
				if (!districtId) return '#d1d5db';
				return styleMap.get(String(districtId))?.fill ?? '#d1d5db';
			})
			.attr('fill-opacity', (d) => {
				const districtId = adapter.getDistrictId(d);
				if (!districtId) return 0.35;
				if (selectedDistrict && String(districtId) === selectedDistrict) return 0.9;
				return styleMap.get(String(districtId))?.fillOpacity ?? 0.35;
			})
			.attr('stroke-width', (d) => {
				const districtId = adapter.getDistrictId(d);
				return districtId && String(districtId) === selectedDistrict ? 2 : 0.6;
			})
			.on('mouseover', (event, d) => {
				if (isMapMovingRef.current) return;
				const districtId = adapter.getDistrictId(d);
				if (!districtId) return;
				if (!isSelectionLocked && selectedFeatureRef.current !== d) {
					highlightFeature(select(event.currentTarget));
				}
				showTooltip(event, d);
				if (!isSelectionLocked) {
					onHoverDistrict?.({
						districtId: String(districtId),
						districtName: adapter.getDistrictName(d)
					});
				}
			})
			.on('mousemove', (event) => {
				if (isMapMovingRef.current) return;
				moveTooltip(event);
			})
			.on('mouseout', (event, d) => {
				if (isMapMovingRef.current) return;
				const isInternalTransition = isTransitioningToAnotherDistrict(event);
				if (!isSelectionLocked && selectedFeatureRef.current !== d) {
					resetFeatureStyle(select(event.currentTarget), d);
				}
				if (!isInternalTransition) {
					hideTooltip();
					if (!isSelectionLocked) onLeaveDistrict?.();
				}
			})
			.on('click', (event, d) => {
				if (isMapMovingRef.current) return;
				const districtId = adapter.getDistrictId(d);
				if (!districtId) return;

				// Toggle selected riding by clicking it again.
				if (selectedFeatureRef.current === d) {
					resetFeatureStyle(select(event.currentTarget), d);
					selectedFeatureRef.current = null;
				} else {
					if (selectedFeatureRef.current) {
						groupRef.current
							.selectAll('path.district')
							.filter((pathD) => pathD === selectedFeatureRef.current)
							.attr('fill-opacity', (pathD) => getOpacity(pathD))
							.attr('stroke-width', 0.6);
					}
					selectedFeatureRef.current = d;
					highlightFeature(select(event.currentTarget));
				}

				showTooltip(event, d);
				onSelectDistrict?.({
					districtId: String(districtId),
					districtName: adapter.getDistrictName(d)
				});
			});
	}, [
		adapter,
		features,
		isMapReady,
		isSelectionLocked,
		onHoverDistrict,
		onLeaveDistrict,
		onSelectDistrict,
		selectedDistrict,
		styleMap,
		tooltipMetaMap
	]);

	return (
		<div className="election-map-root">
			<div ref={containerRef} className="election-map-container" />
			{loadError ? <p className="error">{loadError}</p> : null}
		</div>
	);
}
