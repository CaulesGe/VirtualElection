'use client';

import { useCallback, useMemo, useState } from 'react';
import VirtualElectionMap from '@/lib/components/virtualElection/MapComponent/VirtualElectionMap';
import RidingBarChart from '@/lib/components/virtualElection/MapComponent/RidingBarChart';
import { getPartyColor, getPartyShortName } from '@/lib/components/virtualElection/partyMeta';
import { getMapAdapter } from '@/lib/components/virtualElection/MapComponent/adapters';

export default function MapController({
	ridingResults,
	virtualTotals,
	selectedRiding,
	onSelectRiding,
	mapMetadata
}) {
	const [searchQuery, setSearchQuery] = useState('');
	const [hoveredDistrict, setHoveredDistrict] = useState(null);
	const [lastPreviewDistrict, setLastPreviewDistrict] = useState(null);

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

	const filteredRidings = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return ridingResults ?? [];
		return (ridingResults ?? []).filter((riding) => {
			return (
				String(riding.code).toLowerCase().includes(query) ||
				String(riding.name).toLowerCase().includes(query)
			);
		});
	}, [ridingResults, searchQuery]);

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
		setHoveredDistrict((prev) => (prev === null ? prev : null));
	}, [selectedDistrictId]);

	function handleSelectFromSearch(riding) {
		if (selectedDistrictId && selectedDistrictId === String(riding.code)) {
			onSelectRiding(null);
		} else {
			onSelectRiding(riding);
		}
		setSearchQuery('');
	}

	return (
		<div className="map-controller">
			<h3 className="riding-map-title">Riding Map</h3>
			<div className="search-wrap">
				<input
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.target.value)}
					placeholder="Search riding by code or name..."
				/>
			</div>
			{searchQuery ? (
				<div className="map-search-results">
					{filteredRidings.slice(0, 8).map((riding) => (
						<button key={riding.code} type="button" onClick={() => handleSelectFromSearch(riding)}>
							{riding.code} - {riding.name}
						</button>
					))}
				</div>
			) : null}

			<div className="map-shell">
				<VirtualElectionMap
					adapter={adapter}
					mapVersion={mapVersion}
					districtStyles={districtStyles}
					selectedDistrictId={selectedDistrictId}
					onHoverDistrict={handleHoverDistrict}
					onLeaveDistrict={handleLeaveDistrict}
					onSelectDistrict={handleSelectDistrict}
				/>
				<div className="riding-bar-chart-overlay">
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