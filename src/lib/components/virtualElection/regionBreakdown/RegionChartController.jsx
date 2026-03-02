'use client';

import { useMemo, useState } from 'react';
import RegionSeatChart from '@/lib/components/virtualElection/regionBreakdown/RegionSeatChart';
import RegionVoteChart from '@/lib/components/virtualElection/regionBreakdown/RegionVoteChart';
import { getRegionProfile } from '@/lib/components/virtualElection/regionBreakdown/profiles';
import styles from './RegionChartController.module.css';

export default function RegionChartController({
	totals = [],
	ridingResults = [],
	countryCode = 'CA',
	mode = 'house'
}) {
	const profile = useMemo(() => getRegionProfile(countryCode), [countryCode]);
	const regionOptions = useMemo(() => profile.getRegionOptions(ridingResults), [profile, ridingResults]);
	const [selectedRegion, setSelectedRegion] = useState('Total');
	const [chartMode, setChartMode] = useState('bar');
	const hasSelectedRegion = regionOptions.some((option) => option.value === selectedRegion);
	const effectiveSelectedRegion = hasSelectedRegion ? selectedRegion : 'Total';

	const ridingById = useMemo(() => {
		const map = new Map();
		for (const riding of ridingResults) {
			const code = riding?.code ?? riding?.id ?? riding?.ridingId;
			if (code != null) map.set(String(code), riding);
		}
		return map;
	}, [ridingResults]);

	const filteredTotalsByRegion = useMemo(() => {
		if (effectiveSelectedRegion === 'Total') return totals;
		const selected = regionOptions.find((option) => option.value === effectiveSelectedRegion);
		if (!selected) return totals;
		const selectedCodes = new Set(
			selected.codes.map((code) => profile.toCanonicalRegionCode(code))
		);
		return totals.filter((row) => {
			const riding = ridingById.get(String(row.ridingId));
			const resolved = profile.resolveRegionCode({ riding, row });
			const subnational = profile.toCanonicalRegionCode(resolved);
			return selectedCodes.has(subnational);
		});
	}, [effectiveSelectedRegion, totals, ridingById, profile, regionOptions]);

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
		<section className={styles.breakdown}>
			<div className={styles.header}>
				<h2>Regional Breakdown</h2>
				<div className={styles.controls}>
					<label htmlFor="virtual-region-selector" className={styles.regionLabel}>
						Select a region
					</label>
					<select
						id="virtual-region-selector"
						className={styles.selector}
						value={effectiveSelectedRegion}
						onChange={(event) => setSelectedRegion(event.target.value)}
					>
						{regionOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<div className={styles.modeToggle} role="group" aria-label="Regional chart mode">
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
			<div className={`${styles.grid} ${mode === 'president' ? styles.gridSingle : ''}`}>
				{mode !== 'president' ? (
					<section className={styles.card}>
						<h3>Seat Distribution (Leads by Riding) - {effectiveSelectedRegion}</h3>
						<RegionSeatChart seatSeries={regionSeatSeries} mode={chartMode} />
					</section>
				) : null}
				<section className={styles.card}>
					<h3>Vote Distribution (Virtual Votes) - {effectiveSelectedRegion}</h3>
					<RegionVoteChart voteSeries={regionVoteSeries} mode={chartMode} />
				</section>
			</div>
		</section>
	);
}
