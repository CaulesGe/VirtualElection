<script lang="ts">
	import { browser } from '$app/environment';
	import { select, group, geoPath, geoTransform, type Selection } from 'd3';
	import { feature } from 'topojson-client';
	import 'leaflet/dist/leaflet.css';
	import { onMount, onDestroy } from 'svelte';
	import { tick } from 'svelte';
	import { untrack } from 'svelte';
	import { getPartyColorByName } from '$lib/components/historicalResult/shared/PartyColor';
	import { getPartyKeyFromCandidate } from '$lib/components/historicalResult/shared/PartyName';
	
	// Convert TopoJSON to GeoJSON if needed
	function ensureGeoJSON(input: any): any {
		if (!input) return null;
		// Already GeoJSON
		if (input.type === 'FeatureCollection' && Array.isArray(input.features)) return input;
		// TopoJSON - convert to GeoJSON
		if (input.type === 'Topology' && input.objects) {
			const objName = Object.keys(input.objects)[0];
			if (objName) {
				try {
					return feature(input, input.objects[objName]);
				} catch (e) {
					console.warn('Failed to convert TopoJSON:', e);
					return null;
				}
			}
		}
		return null;
	}

	// Props
	let { selectedElection, allCandidatesByRiding, setSelectedRidingCandidates, geoDataSet } =
		$props<{
			selectedElection: string;
			allCandidatesByRiding: any[];
			setSelectedRidingCandidates: (list: any[]) => void;
			geoDataSet: Record<string, any>;
		}>();

	// Leaflet runtime
	let L: any;
	let map: any;
	let mapContainer!: HTMLDivElement;

	// D3 overlay
	let overlaySvg: Selection<SVGSVGElement, unknown, null, undefined>;
	let ridings: Selection<SVGPathElement, any, SVGGElement, unknown>;
	let tooltip: Selection<HTMLDivElement, unknown, null, undefined>;
	//let redraw: (() => void) | null = null;
	let pathGen: any;
	let redrawRaf: number | null = null;

	// Selection state
	let selectedRiding: any = null;

	// Dataset eras
	const elections2025 = new Set(['2025']);
	const elections20152021 = new Set(['2015', '2019', '2021']);
	const elections20042011 = new Set(['2004', '2006', '2008', '2011']);
	const elections2000 = new Set(['2000']);
	// Pre-2000 elections (1997 and earlier) - all use fedid/fedname fields
	const isPre2000Election = $derived.by(() => {
		const year = parseInt(selectedElection);
		return Number.isFinite(year) && year >= 1867 && year <= 1997;
	});

	// Geo sources provided by parent - make reactive so they update when geoDataSet changes
	let geoData2025 = $derived(geoDataSet['2025']);
	let geoData20132023 = $derived(geoDataSet['2013-2023']);
	let geoData20022012 = $derived(geoDataSet['2002-2012']);
	let geoData2000 = $derived(geoDataSet['2000']);
	
	// For pre-2000 elections, find the best available boundary data from all pre-1997 years
	let geoDataPre2000 = $derived.by(() => {
		// Try the specific year first
		if (geoDataSet[selectedElection]) {
			return geoDataSet[selectedElection];
		}
		// Find the nearest available pre-1997 year from geoDataSet
		const year = parseInt(selectedElection);
		if (!isNaN(year) && year <= 1997) {
			// Get all pre-1997 years from geoDataSet, sorted descending
			const pre1997Years = Object.keys(geoDataSet)
				.map(y => parseInt(y))
				.filter(y => !isNaN(y) && y <= 1997 && y >= 1867)
				.sort((a, b) => b - a); // Descending order (most recent first)
			
			// Find the closest year that is <= election year
			// (boundaries used in an election were set before or in that year)
			for (const availableYear of pre1997Years) {
				if (availableYear <= year && geoDataSet[String(availableYear)]) {
					return geoDataSet[String(availableYear)];
				}
			}
		}
		// Final fallback to 1997
		return geoDataSet['1997'];
	});

	// Active fields + data per era
	// let federalName = $state('fed_name_en');
	// let federalCode = $state('fed_code');
	// let geoData = $state<any>(geoData20132023);

	// 2025 data fields in riding.json
	let federalName = $state('ED_NAMEE');
	let federalCode = $state('FED_NUM');
	let geoData = $state<any>(null);

	let mapReady = $state(false);

	let isMapMoving = false;

	// Fast lookup: districtNumber -> candidates[]
	let candidateMap = $state<Map<string, any[]>>(new Map());

	// Helper function to get party color from candidate string
	function getPartyColorFromCandidate(candidate: string): string {
		if (!candidate) return '#ccc';
		const partyKey = getPartyKeyFromCandidate(candidate, selectedElection);
		return getPartyColorByName(partyKey);
	}

	// Dual-layer groups and current active group
	let g2002_2012: Selection<SVGGElement, unknown, null, undefined>;
	let g2013_2023: Selection<SVGGElement, unknown, null, undefined>;
	let g2025: Selection<SVGGElement, unknown, null, undefined>;
	let g2000: Selection<SVGGElement, unknown, null, undefined>;
	let g1997: Selection<SVGGElement, unknown, null, undefined>;
	let currentGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
	
	// Store field names per group so we can use the correct ones when rendering
	const groupFieldNames = new Map<Selection<SVGGElement, unknown, null, undefined>, { code: string; name: string }>();

	// Switch dataset when crossing the 2013 boundary:
	// - update fields
	// - toggle visible group
	// - trigger re-render for pre-2000 elections (since they share one group but have different geo data)
	$effect(() => {
		if (!selectedElection) return;
		// Wait for map groups to be initialized
		if (!g1997 || !g2000 || !g2002_2012 || !g2013_2023 || !g2025) return;

		// Helper to hide all groups and show the selected one
		const showGroup = (groupToShow: Selection<SVGGElement, unknown, null, undefined> | undefined) => {
			g1997?.style('display', 'none').style('visibility', 'hidden');
			g2000?.style('display', 'none').style('visibility', 'hidden');
			g2002_2012?.style('display', 'none').style('visibility', 'hidden');
			g2013_2023?.style('display', 'none').style('visibility', 'hidden');
			g2025?.style('display', 'none').style('visibility', 'hidden');
			groupToShow?.style('display', 'block').style('visibility', 'visible');
		};

		if (elections2025.has(selectedElection)) {
			// 2025 era
			federalName = 'ED_NAMEE';
			federalCode = 'FED_NUM';
			geoData = geoData2025;
			if (geoData2025 && mapReady) {
				renderRidings(geoData2025, g2025, 'FED_NUM', 'ED_NAMEE');
			}
			showGroup(g2025);
			currentGroup = g2025;
			selectedRiding = null;
		} else if (elections20152021.has(selectedElection)) {
			// 2015–2021 era
			federalName = 'fed_name_en';
			federalCode = 'fed_code';
			geoData = geoData20132023;
			if (geoData20132023 && mapReady) {
				renderRidings(geoData20132023, g2013_2023, 'fed_code', 'fed_name_en');
			}
			showGroup(g2013_2023);
			currentGroup = g2013_2023;
			selectedRiding = null;
		} else if (elections20042011.has(selectedElection)) {
			// 2004–2011 era
			federalName = 'FEDNAME';
			federalCode = 'FEDUID';
			geoData = geoData20022012;
			if (geoData20022012 && mapReady) {
				renderRidings(geoData20022012, g2002_2012, 'FEDUID', 'FEDNAME');
			}
			showGroup(g2002_2012);
			currentGroup = g2002_2012;
			selectedRiding = null;
		} else if (elections2000.has(selectedElection)) {
			// 2000 era
			federalName = 'FED_NAME';
			federalCode = 'FED_NUM';
			geoData = geoData2000;
			if (geoData2000 && mapReady) {
				renderRidings(geoData2000, g2000, 'FED_NUM', 'FED_NAME');
			}
			showGroup(g2000);
			currentGroup = g2000;
			selectedRiding = null;
		} else if (isPre2000Election) {
			// Pre-2000 era - uses year-prefixed district numbers (e.g., '199710001' for 1997, '199310001' for 1993)
			federalName = 'fedname';
			federalCode = 'fedid';
			
			// Compute the geo data directly here to avoid timing issues with derived values
			// Try the specific year first, then fall back to nearest available
			let pre2000Geo = geoDataSet[selectedElection];
			if (!pre2000Geo) {
				const year = parseInt(selectedElection);
				if (!isNaN(year) && year <= 1997) {
					const pre1997Years = Object.keys(geoDataSet)
						.map(y => parseInt(y))
						.filter(y => !isNaN(y) && y <= 1997 && y >= 1867)
						.sort((a, b) => b - a);
					for (const availableYear of pre1997Years) {
						if (availableYear <= year && geoDataSet[String(availableYear)]) {
							pre2000Geo = geoDataSet[String(availableYear)];
							break;
						}
					}
				}
				if (!pre2000Geo) pre2000Geo = geoDataSet['1997'];
			}
			
			geoData = pre2000Geo;
			// Re-render the pre-2000 group with the current year's geo data
			// This is needed because pre-2000 elections share one SVG group but have year-specific boundaries
			if (pre2000Geo && mapReady) {
				renderRidings(pre2000Geo, g1997, 'fedid', 'fedname');
			}
			showGroup(g1997);
			currentGroup = g1997;
			selectedRiding = null;
		}

		// After switching eras, reproject visible group
		scheduleRedraw();
	});

	// Responsive: invalidate map size on viewport changes
	function handleResize() {
		// Leaflet needs explicit invalidateSize after container dimension changes
		map && map.invalidateSize({ pan: false });
	}

	onMount(async () => {
		await tick();
		const leaflet = await import('leaflet');
		L = leaflet.default;
		initializeMap();
		mapReady = true;

		// Initial size validation & listener for responsive behavior
		handleResize();
		window.addEventListener('resize', handleResize);

		// Tooltip
		if (!tooltip || tooltip.empty()) {
			tooltip = select(document.body)
				.append('div')
				.attr('id', 'map-tooltip')
				.style('position', 'fixed')
				.style('pointer-events', 'none')
				.style('z-index', '400')
				.style('background', 'rgba(255,255,255,0.97)')
				.style('border', '1px solid #888')
				.style('border-radius', '6px')
				.style('padding', '10px')
				.style('box-shadow', '0 2px 12px rgba(0,0,0,0.15)')
				.style('display', 'none')
				.style('visibility', 'hidden')
				.style('opacity', '0');
		}
	});

	// Pre-render ONLY the modern eras (2000+) when data becomes available
	// These don't change between years within an era, so we can safely pre-render them once
	// Pre-2000 elections are rendered on-demand in the era-switch effect because each year has different boundaries
	$effect(() => {
		if (!mapReady || !g2000 || !g2002_2012 || !g2013_2023 || !g2025) return;
		
		// Modern eras only - pre-2000 is rendered on-demand
		if (geoData2000) {
			renderRidings(geoData2000, g2000, 'FED_NUM', 'FED_NAME');
		}
		if (geoData20022012) {
			renderRidings(geoData20022012, g2002_2012, 'FEDUID', 'FEDNAME');
		}
		if (geoData20132023) {
			renderRidings(geoData20132023, g2013_2023, 'fed_code', 'fed_name_en');
		}
		if (geoData2025) {
			renderRidings(geoData2025, g2025, 'FED_NUM', 'ED_NAMEE');
		}
	});

	// Build candidateMap when allCandidatesByRiding changes
	// Sort candidates by votes (descending) before grouping to ensure arr[0] is always the winner
	$effect(() => {
		const candidates = allCandidatesByRiding ?? [];
		
		// Sort by votes obtained (descending) - highest votes first
		// Note: Candidates with 0 votes (acclaimed) are still included and sorted
		const sortedCandidates = [...candidates].sort((a, b) => {
			const votesA = Number(a['Votes Obtained'] || a['Votes Obtained/Votes obtenus'] || 0);
			const votesB = Number(b['Votes Obtained'] || b['Votes Obtained/Votes obtenus'] || 0);
			return votesB - votesA; // Descending order
		});
		
		// Group by district number - normalize to string for consistent matching
		// Store both string and number keys to handle geo data format variations
		const map = new Map<string, any[]>();
		
		for (const candidate of sortedCandidates) {
			const districtNum = candidate['Electoral District Number'] || 
			                    candidate['Electoral District Number/Numéro de circonscription'];
			
			// Add to district number map
			if (districtNum != null) {
				const key = String(districtNum);
				if (!map.has(key)) {
					map.set(key, []);
				}
				map.get(key)!.push(candidate);
				
				// Also add without year prefix for matching
				if (key.length >= 8 && /^\d{4}\d+$/.test(key)) {
					const withoutYear = key.substring(4);
					if (!map.has(withoutYear)) {
						map.set(withoutYear, []);
					}
					map.get(withoutYear)!.push(candidate);
				}
			}
		}
		candidateMap = map;
	});

	// Styling effect: runs when allCandidatesByRiding / candidateMap changes
	$effect(() => {
		const len = allCandidatesByRiding?.length ?? 0;
		const candidateMapSize = candidateMap.size;
		const group = currentGroup;

		if (!map || !group || len === 0) return;

		// Get the field names for this group
		const fieldNames = groupFieldNames.get(group);
		if (!fieldNames) return;

		// Create closures that use the correct field names for this group
		const getFillColorForGroup = (d: any) => {
			const codeValue = d.properties?.[fieldNames.code];
			if (codeValue == null) return '#ccc';
			
			// For pre-2000 elections, district codes may have year prefixes that don't match
			// Try matching with and without year prefix (first 4 digits)
			const codeStr = String(codeValue);
			const codeNum = typeof codeValue === 'number' ? codeValue : 
			               (!isNaN(Number(codeValue)) ? Number(codeValue) : null);
			
			// Try exact string match first
			let arr = candidateMap.get(codeStr);
			
			// If not found, try without year prefix (for pre-2000 elections)
			// Format: YYYY + PROVINCE_CODE + DISTRICT_NUMBER (e.g., "186712004" or "187235055")
			if (!arr && codeStr.length >= 8 && /^\d{4}\d+$/.test(codeStr)) {
				const withoutYear = codeStr.substring(4); // Remove first 4 digits (year)
				arr = candidateMap.get(withoutYear);
				// Also try matching candidate codes without year prefix
				if (!arr) {
					for (const [key, value] of candidateMap.entries()) {
						if (key.length >= 8 && /^\d{4}\d+$/.test(key)) {
							const candidateWithoutYear = key.substring(4);
							if (candidateWithoutYear === withoutYear) {
								arr = value;
								break;
							}
						}
					}
				}
			}
			
			// If still not found and we have a number, try number key
			if (!arr && codeNum != null) {
				arr = candidateMap.get(String(codeNum));
			}
			
			if (!arr?.length) return '#ccc';
			
			const candidate = String(arr[0]?.['Candidate'] ?? '');
			if (!candidate) return '#ccc';
			
			return getPartyColorFromCandidate(candidate);
		};
		
		const getFillOpacityForGroup = (d: any) => {
			// Use nullish coalescing to handle 0 as a valid value
			const codeValue = d.properties?.[fieldNames.code];
			const code = codeValue != null ? String(codeValue) : '';
			let arr = candidateMap.get(code);
			
			// Try without year prefix if not found
			if (!arr && code.length >= 8 && /^\d{4}\d+$/.test(code)) {
				const withoutYear = code.substring(4);
				arr = candidateMap.get(withoutYear);
			}
			
			const pct = Number(arr?.[0]?.['Percentage of Votes Obtained']);
			return Number.isFinite(pct) ? Math.max(0.1, Math.min(1, pct / 100)) : 0.3;
		};

		// no new paths, just recolor existing ones
		group
			.selectAll<SVGPathElement, any>('path.riding')
			.attr('fill', getFillColorForGroup)
			.attr('fill-opacity', getFillOpacityForGroup);
	});

	onDestroy(() => {
		tooltip?.remove();
		if (browser && redrawRaf != null) {
			cancelAnimationFrame(redrawRaf);
			redrawRaf = null;
		}
		if (map) {
			map.off('zoomend');
			map.off('moveend');
			map.remove();
			map = null;
		}
		// Guard for SSR: window is undefined during server render teardown
		if (browser) {
			window.removeEventListener('resize', handleResize);
		}
	});

	//  <--------------------------------------helper methods------------------------------------>

	function scheduleRedraw() {
		if (!browser) return;
		if (redrawRaf != null) cancelAnimationFrame(redrawRaf);
		redrawRaf = requestAnimationFrame(() => {
			redrawRaf = null;
			redraw();
		});
	}

	// Single redraw handler: reproject ONLY currentGroup
	function redraw() {
		if (!map || !currentGroup || !pathGen) return;
		currentGroup
			.selectAll<SVGPathElement, any>('path.riding')
			.attr('d', (d: any) => pathGen(d as any));
	}

	function initializeMap() {
		map = L.map(mapContainer, { zoomSnap: 0.25 }).setView([56, -96], 3.5);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap, © CARTO'
		}).addTo(map);

		// Single SVG overlay
		L.svg().addTo(map);
		overlaySvg = select(map.getPanes().overlayPane).select<SVGSVGElement>('svg');

		// Create projection/path ONCE and reuse on every redraw (reduces work on zoom/move).
		const projection = createProjection(map);
		pathGen = geoPath().projection(projection);

		// Two groups, one per era
		g1997 = overlaySvg.append('g').attr('class', 'ridings 1997');
		g2000 = overlaySvg.append('g').attr('class', 'ridings 2000');
		g2002_2012 = overlaySvg.append('g').attr('class', 'ridings 2002-2012');
		g2013_2023 = overlaySvg.append('g').attr('class', 'ridings 2013-2023');
		g2025 = overlaySvg.append('g').attr('class', 'ridings 2025');

		// Start with modern era visible
		g1997.style('display', 'none');
		g2000.style('display', 'none');
		g2002_2012.style('display', 'none');
		g2013_2023.style('display', 'none');
		g2025.style('display', 'block');
		currentGroup = g2025;

		// disable hitTesting and tooltip when move map
		const hideTooltipInstant = () => {
			tooltip?.interrupt();
			tooltip?.style('opacity', '0').style('display', 'none');
		};

		map.on('movestart', () => {
			isMapMoving = true;
			overlaySvg.style('pointer-events', 'none');
			hideTooltipInstant();
		});

		map.on('moveend', () => {
			// Avoid setTimeout handler warnings; re-enable interactivity next paint.
			if (browser) {
				requestAnimationFrame(() => {
					isMapMoving = false;
					overlaySvg.style('pointer-events', 'auto');
				});
			} else {
				isMapMoving = false;
				overlaySvg.style('pointer-events', 'auto');
			}
			scheduleRedraw();
		});

		map.on('zoomstart', () => {
			isMapMoving = true;
			overlaySvg.style('pointer-events', 'none');
			hideTooltipInstant();
		});

		map.on('zoomend', () => {
			// Avoid setTimeout handler warnings; re-enable interactivity next paint.
			if (browser) {
				requestAnimationFrame(() => {
					isMapMoving = false;
					overlaySvg.style('pointer-events', 'auto');
				});
			} else {
				isMapMoving = false;
				overlaySvg.style('pointer-events', 'auto');
			}
			scheduleRedraw();
		});
	}

	function renderRidings(
		geo: any,
		group: Selection<SVGGElement, unknown, null, undefined>,
		codeField: string,
		nameField: string
	) {
		if (!map || !group || !geo) {
			return;
		}

		// Convert TopoJSON to GeoJSON if needed
		const geoJSON = ensureGeoJSON(geo);
		if (!geoJSON || geoJSON.type !== 'FeatureCollection' || !Array.isArray(geoJSON.features)) {
			console.warn('renderRidings: Invalid geo data, expected FeatureCollection', geo?.type);
			return;
		}

		const features = geoJSON.features;
		
		if (features.length === 0) {
			return;
		}

		if (!pathGen) {
			console.warn('renderRidings: pathGen not initialized yet');
			return;
		}

		// Store field names for this group
		groupFieldNames.set(group, { code: codeField, name: nameField });
		
		// Create closures that use the correct field names for this group
		const getFillColorForGroup = (d: any) => {
			const codeValue = d.properties?.[codeField];
			if (codeValue == null) return '#ccc';
			
			// For pre-2000 elections, district codes may have year prefixes that don't match
			// Try matching with and without year prefix (first 4 digits)
			const codeStr = String(codeValue);
			const codeNum = typeof codeValue === 'number' ? codeValue : 
			               (!isNaN(Number(codeValue)) ? Number(codeValue) : null);
			
			// Try exact string match first
			let arr = candidateMap.get(codeStr);
			
			// If not found, try without year prefix (for pre-2000 elections)
			// Format: YYYY + PROVINCE_CODE + DISTRICT_NUMBER (e.g., "186712004" or "187235055")
			if (!arr && codeStr.length >= 8 && /^\d{4}\d+$/.test(codeStr)) {
				const withoutYear = codeStr.substring(4); // Remove first 4 digits (year)
				arr = candidateMap.get(withoutYear);
				// Also try matching candidate codes without year prefix
				if (!arr) {
					for (const [key, value] of candidateMap.entries()) {
						if (key.length >= 8 && /^\d{4}\d+$/.test(key)) {
							const candidateWithoutYear = key.substring(4);
							if (candidateWithoutYear === withoutYear) {
								arr = value;
								break;
							}
						}
					}
				}
			}
			
			// If still not found and we have a number, try number key
			if (!arr && codeNum != null) {
				arr = candidateMap.get(String(codeNum));
			}
			
			if (!arr?.length) return '#ccc';
			
			const candidate = String(arr[0]?.['Candidate'] ?? '');
			if (!candidate) return '#ccc';
			
			return getPartyColorFromCandidate(candidate);
		};
		
		const getFillOpacityForGroup = (d: any) => {
			// Use nullish coalescing to handle 0 as a valid value
			const codeValue = d.properties?.[codeField];
			const code = codeValue != null ? String(codeValue) : '';
			let arr = candidateMap.get(code);
			
			// Try without year prefix if not found
			if (!arr && code.length >= 8 && /^\d{4}\d+$/.test(code)) {
				const withoutYear = code.substring(4);
				arr = candidateMap.get(withoutYear);
			}
			
			const pct = Number(arr?.[0]?.['Percentage of Votes Obtained']);
			return Number.isFinite(pct) ? Math.max(0.1, Math.min(1, pct / 100)) : 0.3;
		};

		ridings = group
			.selectAll<SVGPathElement, any>('path.riding')
			.data(features, (d: any) => {
				// Use nullish coalescing to handle 0 as a valid value
				const codeValue = d.properties?.[codeField];
				const code = codeValue != null ? String(codeValue) : '';
				if (code === '' && codeValue == null) {
					console.warn('renderRidings: Feature missing code field', codeField, d.properties);
				}
				return code;
			})
			.join(
				(enter) =>
					enter
						.append('path')
						.attr('class', 'riding leaflet-interactive')
						.attr('stroke', '#666')
						.attr('stroke-width', 0.8)
						.attr('fill', getFillColorForGroup)
						.attr('fill-opacity', getFillOpacityForGroup)
						.attr('d', (d: any) => {
							try {
								return pathGen(d as any) || '';
							} catch (e) {
								return '';
							}
						}),
				(update) =>
					update
						.attr('fill', getFillColorForGroup)
						.attr('fill-opacity', getFillOpacityForGroup)
						.attr('d', (d: any) => {
							try {
								return pathGen(d as any) || '';
							} catch (e) {
								console.warn('Error updating path for feature:', e, d);
								return '';
							}
						}),
				(exit) => exit.remove()
			);
		
		// Ensure paths are redrawn after rendering
		scheduleRedraw();

		// Pointer interactions (overwrite each time, but we only call this twice)
		ridings
			.on('mouseover', (event, d) => {
				if (selectedRiding || isMapMoving) return;
				// Use nullish coalescing to handle 0 as a valid value
				const codeValue = d.properties?.[codeField];
				const selected = findCandidatesByCodeValue(codeValue);
				if (selected.length === 0) {
					console.log('no candidates found for riding: ', codeValue);
					return;
				}
				untrack(() => setSelectedRidingCandidates(selected));

				select(event.currentTarget as SVGPathElement)
					.attr('fill-opacity', 0.9)
					.attr('stroke-width', 2);

				showTooltipAtPage(event as MouseEvent, `<div>${d.properties[nameField] ?? ''}</div>`);
			})
			.on('mousemove', (event, d) => {
				if (selectedRiding || isMapMoving) return;
				moveTooltip(event as MouseEvent);
			})
			.on('mouseout', (event, d) => {
				if (selectedRiding || isMapMoving) return;
				select(event.currentTarget as SVGPathElement)
					.attr('fill-opacity', getFillOpacityForGroup(d))
					.attr('stroke-width', 0.4);

				hideTooltip();
			})
			.on('click', (event, d) => handleRidingClick(d, event));
	}

	function createProjection(map: any) {
		const projectPoint = function (this: any, lon: number, lat: number) {
			const pt = map.latLngToLayerPoint([lat, lon]);
			this.stream.point(pt.x, pt.y);
		};
		return geoTransform({ point: projectPoint });
	}

	function getFillColor(d: any) {
		const code = String(d.properties[federalCode]);
		const arr = candidateMap.get(code);
		if (!arr?.length) return '#ccc';
		const candidate = String(arr[0]?.['Candidate'] ?? '');
		return getPartyColorFromCandidate(candidate);
	}

	function getFillOpacity(d: any) {
		const code = String(d.properties[federalCode]);
		const arr = candidateMap.get(code);
		const pct = Number(arr?.[0]?.['Percentage of Votes Obtained']);
		return Number.isFinite(pct) ? Math.max(0.1, Math.min(1, pct / 100)) : 0.3;
	}

	function findCandidatesByCodeValue(codeValue: unknown): any[] {
		if (codeValue == null) return [];
		const codeStr = String(codeValue);

		// 1. Try exact district code match
		let arr = candidateMap.get(codeStr);

		// 2. If not found, try matching without year prefix (for pre-2000 elections)
		if (!arr && codeStr.length >= 8 && /^\d{4}\d+$/.test(codeStr)) {
			const withoutYear = codeStr.substring(4);
			arr = candidateMap.get(withoutYear);
			if (!arr) {
				for (const [key, value] of candidateMap.entries()) {
					if (key.length >= 8 && /^\d{4}\d+$/.test(key)) {
						const candidateWithoutYear = key.substring(4);
						if (candidateWithoutYear === withoutYear) {
							arr = value;
							break;
						}
					}
				}
			}
		}

		return arr || [];
	}

	function handleRidingClick(d: any, event: MouseEvent | null = null) {
		if (isMapMoving) return;
		const group = currentGroup;
		if (!group) return;

		// Get field names for this group
		const fieldNames = groupFieldNames.get(group);
		if (!fieldNames) return;

		// Create helper function for opacity
		const getFillOpacityForGroup = (feature: any) => {
			const arr = findCandidatesByCodeValue(feature.properties?.[fieldNames.code]);
			const pct = Number(arr?.[0]?.['Percentage of Votes Obtained']);
			return Number.isFinite(pct) ? Math.max(0.1, Math.min(1, pct / 100)) : 0.3;
		};

		// deselect
		if (selectedRiding === d) {
			selectedRiding = null;
			group
				.selectAll<SVGPathElement, any>('path.riding')
				.filter((pathD) => pathD === d)
				.attr('fill-opacity', () => getFillOpacityForGroup(d))
				.attr('stroke-width', 0.4);

			tooltip.style('display', 'none').style('opacity', '0');
			return;
		}

		// reset prev selection
		if (selectedRiding) {
			const prev = selectedRiding;
			group
				.selectAll<SVGPathElement, any>('path.riding')
				.filter((pathD) => pathD === prev)
				.attr('fill-opacity', () => getFillOpacityForGroup(prev))
				.attr('stroke-width', 0.4);
		}

		// current selection
		selectedRiding = d;
		group
			.selectAll<SVGPathElement, any>('path.riding')
			.filter((pathD) => pathD === selectedRiding)
			.attr('fill-opacity', 0.9)
			.attr('stroke-width', 2);

		// On click, don't show tooltip (it can be blank depending on which era fields are active).
		// Hover tooltip is still available via mouseover/mousemove handlers.
		hideTooltip();

		// Use nullish coalescing to handle 0 as a valid value
		const codeValue = d.properties?.[fieldNames.code];
		const selected = findCandidatesByCodeValue(codeValue);
		setSelectedRidingCandidates(selected);
	}

	function showTooltipAtPage(event: MouseEvent, html: string) {
		tooltip
			.style('display', 'block')
			.style('visibility', 'visible')
			.style('opacity', '1')
			.style('left', `${event.clientX + 12}px`)
			.style('top', `${event.clientY - 16}px`)
			.html(html);
	}

	function moveTooltip(event: MouseEvent) {
		tooltip.style('left', `${event.clientX + 12}px`).style('top', `${event.clientY - 16}px`);
	}

	function hideTooltip() {
		tooltip.style('opacity', '0').style('visibility', 'hidden').style('display', 'none');
	}

	// external API like your React mapRef.zoomToRiding
	export function zoomToRiding(districtNumber: string | number) {
		if (!geoData || !map || !currentGroup) return;
		
		// Get field names for current group
		const fieldNames = groupFieldNames.get(currentGroup);
		if (!fieldNames) {
			console.warn('zoomToRiding: No field names found for current group');
			return;
		}
		if (!geoData.features) {
			console.warn('zoomToRiding: No features found in geo data');
			return;
		}
		const match = geoData.features.find((f: any) => String(f.properties[fieldNames.code]) === String(districtNumber));
		if (!match) {
			console.warn('No geometry found for district:', districtNumber);
			return;
		}
		const bounds = L.geoJSON(match.geometry).getBounds();
		map.flyToBounds(bounds, {
			padding: [20, 20],
			duration: 0.4,
			easeLinearity: 1.0
		});
		handleRidingClick(match, null);
	}
</script>

<div bind:this={mapContainer} class="map-container"></div>

<style global>
	.map-container {
		width: 100%;
		height: 600px;
	}
	@media (max-width: 1024px) {
		.map-container {
			height: 520px;
		}
	}
	@media (max-width: 768px) {
		.map-container {
			height: 55vh;
		}
	}
	@media (max-width: 480px) {
		.map-container {
			height: 50vh;
		}
	}
</style>
