'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import { getPartyColor, getPartyShortName } from '@/lib/components/virtualElection/partyMeta';
import ChartTooltip from '@/lib/components/virtualElection/ChartTooltip';

function buildSeries(ridingTotals, electoralVotes) {
	if (!ridingTotals?.totals) return [];
	const rows = Object.entries(ridingTotals.totals)
		.map(([party, votes]) => ({
			party,
			name: getPartyShortName(party),
			votes: Number(votes ?? 0),
			electoralVotes
		}))
		.sort((a, b) => b.votes - a.votes);
	const totalVotes = rows.reduce((sum, row) => sum + row.votes, 0);
	return rows.map((row) => ({
		...row,
		voteShare: totalVotes > 0 ? Number(((row.votes / totalVotes) * 100).toFixed(1)) : 0
	}));
}

function useContainerSize() {
	const [size, setSize] = useState(null);
	const observerRef = useRef(null);

	const callbackRef = useCallback((el) => {
		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}
		if (!el) return;

		const measure = () => {
			const { width, height } = el.getBoundingClientRect();
			if (width > 0 && height > 0) {
				setSize((prev) =>
					prev && prev.width === Math.round(width) && prev.height === Math.round(height)
						? prev
						: { width: Math.round(width), height: Math.round(height) }
				);
			}
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		observerRef.current = observer;
	}, []);

	return [callbackRef, size];
}

export default function RidingBarChart({ riding, ridingTotals }) {
	const electoralVotes = Number(riding?.electoralVotes ?? 0);
	const data = useMemo(() => buildSeries(ridingTotals, electoralVotes), [electoralVotes, ridingTotals]);
	const [containerRef, size] = useContainerSize();
	const hasData = Boolean(ridingTotals && data.length > 0);

	if (!riding) {
		return <p className="muted">Hover or select a riding to view party vote distribution.</p>;
	}

	return (
		<div className="riding-bar-chart">
			<div className="riding-chart-meta">
				<h4>{riding.name}</h4>
				<p className="muted">
					Code: {riding.code} {riding.subnational ? `| ${riding.subnational}` : ''}
					{electoralVotes > 0 ? ` | EV: ${electoralVotes}` : ''}
				</p>
			</div>
			<div ref={containerRef} style={{ width: '100%', height: 240, minWidth: 200, minHeight: 220 }}>
				{size && hasData ? (
					<BarChart width={size.width} height={size.height} data={data} margin={{ top: 22, right: 10, left: 2, bottom: 10 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis allowDecimals={false} />
						<Tooltip content={
							<ChartTooltip>
								{(row) => (
									<>
										<div style={{ fontWeight: 700 }}>{riding.name}</div>
										{Number(row?.electoralVotes ?? 0) > 0 ? <div>EV: {row.electoralVotes}</div> : null}
										<div style={{ color: getPartyColor(row.party), fontWeight: 600 }}>{row.name}</div>
										<div>Votes: {row.votes}</div>
									</>
								)}
							</ChartTooltip>
						} />
						<Bar dataKey="votes">
							{data.map((row) => (
								<Cell key={row.party} fill={getPartyColor(row.party)} />
							))}
							<LabelList dataKey="voteShare" position="top" formatter={(value) => `${value}%`} />
						</Bar>
					</BarChart>
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							display: 'grid',
							placeItems: 'center'
						}}
					>
						<p className="muted">No virtual votes recorded for this riding yet.</p>
					</div>
				)}
			</div>
		</div>
	);
}
