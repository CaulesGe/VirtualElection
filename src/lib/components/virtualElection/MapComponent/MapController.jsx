'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { List as VirtualList } from 'react-window';
import RidingBarChart from '@/lib/components/virtualElection/MapComponent/RidingBarChart';
import { getPartyColor, getPartyShortName } from '@/lib/components/virtualElection/partyMeta';
import { getMapAdapter } from '@/lib/components/virtualElection/MapComponent/adapters';
import styles from './MapController.module.css';

function SearchResultRow({ index, style, filteredRidings, onSelect }) {
	const riding = filteredRidings[index];
	if (!riding) return null;
	return (
		<button
			type="button"
			style={style}
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => onSelect(riding)}
		>
			{riding.code} - {riding.name}
		</button>
	);
}

const VirtualElectionMap = dynamic(
	() => import('@/lib/components/virtualElection/MapComponent/VirtualElectionMap'),
	{ ssr: false, loading: () => <div className="election-map-container" style={{ display: 'grid', placeItems: 'center' }}>Loading map…</div> }
);

function normalizeSearchText(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

const CANADA_ALIAS_TO_SUBNATIONAL = {
	toronto: 'ON',
	gta: 'ON',
	quebec: 'QC',
	montreal: 'QC',
	ottawa: 'ON',
	vancouver: 'BC',
	calgary: 'AB',
	edmonton: 'AB',
	halifax: 'NS'
};

export default function MapController({
	ridingResults,
	virtualTotals,
	selectedRiding,
	onSelectRiding,
	mapMetadata
}) {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchOpen, setSearchOpen] = useState(false);
	const [hoveredDistrict, setHoveredDistrict] = useState(null);
	const [lastPreviewDistrict, setLastPreviewDistrict] = useState(null);
	const [mapDistricts, setMapDistricts] = useState([]);
	const blurTimeoutRef = useRef(null);
	const leaveTimeoutRef = useRef(null);
	const [zoomToDistrictId, setZoomToDistrictId] = useState(null);

	const countryCode = mapMetadata?.countryCode ?? 'CA';
	const mapVersion = String(mapMetadata?.mapVersion ?? '2025');
	const adapter = useMemo(() => getMapAdapter(countryCode), [countryCode]);

	const ridingById = useMemo(() => {
		const map = new Map();
		for (const riding of ridingResults ?? []) {
			map.set(String(riding.code), riding);
		}
		return map;
	}, [ridingResults]);

	const totalsById = useMemo(() => {
		const map = new Map();
		for (const row of virtualTotals ?? []) {
			map.set(String(row.ridingId), row);
		}
		return map;
	}, [virtualTotals]);

	const selectedDistrictId = selectedRiding ? String(selectedRiding.code) : null;
	const hoverRiding = hoveredDistrict
		? ridingById.get(String(hoveredDistrict.code)) ?? hoveredDistrict
		: null;
	const lastPreviewRiding = lastPreviewDistrict
		? ridingById.get(String(lastPreviewDistrict.code)) ?? lastPreviewDistrict
		: null;
	const chartRiding = selectedRiding ?? hoverRiding ?? lastPreviewRiding;
	const chartTotals = chartRiding ? totalsById.get(String(chartRiding.code)) ?? null : null;

	const districtStyles = useMemo(() => {
		const styleMap = new Map();
		const ids = new Set();
		for (const riding of ridingResults ?? []) {
			ids.add(String(riding.code));
		}
		for (const ridingId of totalsById.keys()) {
			ids.add(String(ridingId));
		}
		for (const ridingId of ids) {
			const row = totalsById.get(ridingId);
			if (!row || !row.leader || (row.totalVotes ?? 0) <= 0) {
				styleMap.set(ridingId, { fill: '#d1d5db', fillOpacity: 0.35 });
				continue;
			}
			styleMap.set(ridingId, {
				fill: getPartyColor(row.leader),
				fillOpacity: Math.max(0.15, Math.min(1, Number(row.intensity ?? 0)))
			});
		}
		return styleMap;
	}, [ridingResults, totalsById]);

	const districtTooltipMeta = useMemo(() => {
		const byId = new Map();
		const ids = new Set([
			...(ridingResults ?? []).map((r) => String(r.code)),
			...totalsById.keys()
		]);
		for (const ridingId of ids) {
			const riding = ridingById.get(String(ridingId));
			const row = totalsById.get(String(ridingId));
			byId.set(String(ridingId), {
				name: riding?.name,
				electoralVotes: Number(riding?.electoralVotes ?? 0),
				totalVotes: Number(row?.totalVotes ?? 0)
			});
		}
		return byId;
	}, [ridingById, ridingResults, totalsById]);

	const searchableRidings = useMemo(() => {
		const seen = new Set();
		const merged = [];
		for (const riding of ridingResults ?? []) {
			seen.add(String(riding.code));
			merged.push(riding);
		}
		for (const district of mapDistricts) {
			if (!seen.has(String(district.code))) {
				seen.add(String(district.code));
				merged.push({ code: district.code, name: district.name, subnational: '' });
			}
		}
		return merged;
	}, [ridingResults, mapDistricts]);

	const filteredRidings = useMemo(() => {
		const query = normalizeSearchText(searchQuery);
		if (!query) return searchableRidings;
		const country = String(countryCode).toUpperCase();
		const aliasSubnational = country === 'CA' ? CANADA_ALIAS_TO_SUBNATIONAL[query] ?? null : null;
		const directMatches = searchableRidings
			.map((riding) => {
				const code = normalizeSearchText(riding.code);
				const name = normalizeSearchText(riding.name);
				const subnational = normalizeSearchText(riding.subnational);
				let rank = Number.POSITIVE_INFINITY;
				if (code === query) rank = 0;
				else if (code.startsWith(query)) rank = 1;
				else if (name.startsWith(query)) rank = 2;
				else if (code.includes(query)) rank = 3;
				else if (name.includes(query)) rank = 4;
				else if (subnational.includes(query)) rank = 5;
				return { riding, rank };
			})
			.filter((entry) => Number.isFinite(entry.rank))
			.sort((a, b) => a.rank - b.rank || String(a.riding.name).localeCompare(String(b.riding.name)))
			.map((entry) => entry.riding);
		if (directMatches.length > 0 || !aliasSubnational) {
			return directMatches;
		}
		return searchableRidings.filter(
			(riding) => String(riding.subnational ?? '').toUpperCase() === aliasSubnational
		);
	}, [countryCode, searchableRidings, searchQuery]);

	const handleSelectDistrict = useCallback(({ districtId, districtName }) => {
		const resolvedDistrictId = String(districtId);
		const riding =
			ridingById.get(resolvedDistrictId) ??
			{
				code: resolvedDistrictId,
				name: districtName || `Riding ${resolvedDistrictId}`,
				subnational: ''
			};
		if (selectedDistrictId && selectedDistrictId === String(districtId)) {
			onSelectRiding(null);
			return;
		}
		setLastPreviewDistrict(riding);
		onSelectRiding(riding);
	}, [onSelectRiding, ridingById, selectedDistrictId]);

	const handleHoverDistrict = useCallback(({ districtId, districtName }) => {
		if (selectedDistrictId) return;
		clearTimeout(leaveTimeoutRef.current);
		const id = String(districtId);
		const hoverRiding =
			ridingById.get(id) ??
			{
				code: id,
				name: districtName || `Riding ${id}`,
				subnational: ''
			};
		setLastPreviewDistrict(hoverRiding);
		setHoveredDistrict((prev) => (prev?.code === id ? prev : hoverRiding));
	}, [selectedDistrictId, ridingById]);

	const handleLeaveDistrict = useCallback(() => {
		if (selectedDistrictId) return;
		clearTimeout(leaveTimeoutRef.current);
		leaveTimeoutRef.current = setTimeout(() => {
			setHoveredDistrict((prev) => (prev === null ? prev : null));
		}, 60);
	}, [selectedDistrictId]);

	function handleSelectFromSearch(riding) {
		const code = String(riding.code);
		if (selectedDistrictId && selectedDistrictId === code) {
			onSelectRiding(null);
			setZoomToDistrictId(null);
		} else {
			onSelectRiding(riding);
			setZoomToDistrictId(code);
		}
		setSearchQuery('');
		setSearchOpen(false);
	}

	function handleSearchFocus() {
		clearTimeout(blurTimeoutRef.current);
		setSearchOpen(true);
	}

	function handleSearchBlur() {
		blurTimeoutRef.current = setTimeout(() => setSearchOpen(false), 150);
	}

	return (
		<div className={styles.controller}>
			<h3 className={styles.title}>Riding Map</h3>
			<div className={styles.searchWrap}>
				<input
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.target.value)}
					onFocus={handleSearchFocus}
					onBlur={handleSearchBlur}
					placeholder="Search riding by code or name..."
				/>
				{searchOpen && filteredRidings.length > 0 ? (
				<div className={styles.searchResults}>
					<VirtualList
						rowComponent={SearchResultRow}
						rowCount={filteredRidings.length}
						rowHeight={36}
						rowProps={{ filteredRidings, onSelect: handleSelectFromSearch }}
						style={{ height: Math.min(filteredRidings.length * 36, 320), willChange: 'transform' }}
					/>
				</div>
			) : null}
			</div>

			<div className={styles.shell}>
				<VirtualElectionMap
					adapter={adapter}
					mapVersion={mapVersion}
					districtStyles={districtStyles}
					districtTooltipMeta={districtTooltipMeta}
					selectedDistrictId={selectedDistrictId}
					zoomToDistrictId={zoomToDistrictId}
					onZoomComplete={() => setZoomToDistrictId(null)}
					onHoverDistrict={handleHoverDistrict}
					onLeaveDistrict={handleLeaveDistrict}
					onSelectDistrict={handleSelectDistrict}
					onFeaturesLoaded={setMapDistricts}
				/>
				<div className={styles.chartOverlay}>
					<RidingBarChart riding={chartRiding} ridingTotals={chartTotals} />
				</div>
			</div>

			{chartTotals ? (
				<p className="muted">
					Leader: {getPartyShortName(chartTotals.leader)} ({(chartTotals.intensity * 100).toFixed(1)}%)
				</p>
			) : null}
		</div>
	);
}
