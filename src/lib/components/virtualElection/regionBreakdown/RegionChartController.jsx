'use client';

import { useMemo, useState } from 'react';
import RegionSeatChart from '@/lib/components/virtualElection/regionBreakdown/RegionSeatChart';
import RegionVoteChart from '@/lib/components/virtualElection/regionBreakdown/RegionVoteChart';

const REGION_OPTIONS = [
	{ value: 'Total', label: 'Canada (Total)', codes: [] },
	{ value: 'N.L.', label: 'Newfoundland and Labrador', codes: ['N.L.', 'NL'] },
	{ value: 'P.E.I.', label: 'Prince Edward Island', codes: ['P.E.I.', 'PE', 'PEI'] },
	{ value: 'N.S.', label: 'Nova Scotia', codes: ['N.S.', 'NS'] },
	{ value: 'N.B.', label: 'New Brunswick', codes: ['N.B.', 'NB'] },
	{ value: 'Que.', label: 'Quebec', codes: ['Que.', 'QC'] },
	{ value: 'Ont.', label: 'Ontario', codes: ['Ont.', 'ON'] },
	{ value: 'Man.', label: 'Manitoba', codes: ['Man.', 'MB'] },
	{ value: 'Sask.', label: 'Saskatchewan', codes: ['Sask.', 'SK'] },
	{ value: 'Alta.', label: 'Alberta', codes: ['Alta.', 'AB'] },
	{ value: 'B.C.', label: 'British Columbia', codes: ['B.C.', 'BC'] },
	{ value: 'Y.T.', label: 'Yukon', codes: ['Y.T.', 'YT'] },
	{ value: 'N.W.T.', label: 'Northwest Territories', codes: ['N.W.T.', 'NT', 'NWT'] },
	{ value: 'Nun.', label: 'Nunavut', codes: ['Nun.', 'NU'] }
];

const REGION_CODE_ALIASES = {
	NL: 'NL',
	NEWFOUNDLAND: 'NL',
	NEWFOUNDLANDANDLABRADOR: 'NL',
	NFLD: 'NL',
	NB: 'NB',
	NEWBRUNSWICK: 'NB',
	YT: 'YT',
	YUKON: 'YT',
	YK: 'YT'
};

function toCanonicalRegionCode(value) {
	const normalized = String(value ?? '')
		.toUpperCase()
		.replace(/[^A-Z]/g, '');
	return REGION_CODE_ALIASES[normalized] ?? normalized;
}

export default function RegionChartController({ totals = [], ridingResults = [] }) {
	const [selectedRegion, setSelectedRegion] = useState('Total');
	const [chartMode, setChartMode] = useState('bar');

	const ridingById = useMemo(() => {
		const map = new Map();
		for (const riding of ridingResults) {
			map.set(String(riding.code), riding);
		}
		return map;
	}, [ridingResults]);

	const filteredTotalsByRegion = useMemo(() => {
		if (selectedRegion === 'Total') return totals;
		const selected = REGION_OPTIONS.find((option) => option.value === selectedRegion);
		if (!selected) return totals;
		const selectedCodes = new Set(selected.codes.map((code) => toCanonicalRegionCode(code)));
		return totals.filter((row) => {
			const riding = ridingById.get(String(row.ridingId));
			const subnational = toCanonicalRegionCode(riding?.subnational);
			return selectedCodes.has(subnational);
		});
	}, [selectedRegion, totals, ridingById]);

	const regionSeatSeries = useMemo(() => {
		const seatCounts = {};
		for (const row of filteredTotalsByRegion) {
			if (!row.leader || (row.totalVotes ?? 0) <= 0) continue;
			seatCounts[row.leader] = (seatCounts[row.leader] ?? 0) + 1;
		}
		const totalSeats = Object.values(seatCounts).reduce((sum, value) => sum + value, 0);
		return { ...seatCounts, Total: totalSeats };
	}, [filteredTotalsByRegion]);

	const regionVoteSeries = useMemo(() => {
		const byPartyVotes = {};
		for (const row of filteredTotalsByRegion) {
			for (const [party, votes] of Object.entries(row.totals ?? {})) {
				byPartyVotes[party] = (byPartyVotes[party] ?? 0) + (votes ?? 0);
			}
		}
		const grandTotal = Object.values(byPartyVotes).reduce((sum, value) => sum + value, 0);
		const result = {};
		for (const [party, votes] of Object.entries(byPartyVotes)) {
			result[party] = {
				party,
				numberOfVote: votes,
				percentageOfVote: grandTotal > 0 ? Number(((votes / grandTotal) * 100).toFixed(1)) : 0
			};
		}
		return result;
	}, [filteredTotalsByRegion]);

	return (
		<section className="regional-breakdown">
			<div className="regional-header">
				<h2>Virtual Regional Breakdown</h2>
				<div className="regional-controls">
					<label htmlFor="virtual-region-selector" className="region-label">
						Select a region
					</label>
					<select
						id="virtual-region-selector"
						value={selectedRegion}
						onChange={(event) => setSelectedRegion(event.target.value)}
					>
						{REGION_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<div className="chart-mode-toggle" role="group" aria-label="Regional chart mode">
						<button
							type="button"
							className={chartMode === 'bar' ? 'active' : ''}
							onClick={() => setChartMode('bar')}
						>
							Bar
						</button>
						<button
							type="button"
							className={chartMode === 'pie' ? 'active' : ''}
							onClick={() => setChartMode('pie')}
						>
							Pie
						</button>
					</div>
				</div>
			</div>
			<div className="regional-grid">
				<section className="regional-card">
					<h3>Seat Distribution (Leads by Riding) - {selectedRegion}</h3>
					<RegionSeatChart seatSeries={regionSeatSeries} mode={chartMode} />
				</section>
				<section className="regional-card">
					<h3>Vote Distribution (Virtual Votes) - {selectedRegion}</h3>
					<RegionVoteChart voteSeries={regionVoteSeries} mode={chartMode} />
				</section>
			</div>
		</section>
	);
}