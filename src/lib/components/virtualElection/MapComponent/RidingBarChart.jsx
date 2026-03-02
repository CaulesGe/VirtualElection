'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getPartyColor, getPartyShortName } from '@/lib/components/virtualElection/partyMeta';

function buildSeries(ridingTotals) {
	if (!ridingTotals?.totals) return [];
	return Object.entries(ridingTotals.totals)
		.map(([party, votes]) => ({
			party,
			name: getPartyShortName(party),
			votes: Number(votes ?? 0)
		}))
		.sort((a, b) => b.votes - a.votes);
}

function RidingTooltip({ active, payload, ridingName }) {
	if (!active || !payload?.length) return null;
	const row = payload[0]?.payload;
	if (!row) return null;
	return (
		<div className="region-vote-tooltip">
			<div style={{ fontWeight: 700 }}>{ridingName}</div>
			<div style={{ color: getPartyColor(row.party), fontWeight: 600 }}>{row.name}</div>
			<div>Votes: {row.votes}</div>
		</div>
	);
}

export default function RidingBarChart({ riding, ridingTotals }) {
	const data = useMemo(() => buildSeries(ridingTotals), [ridingTotals]);

	if (!riding || !ridingTotals) {
		return <p className="muted">Hover or select a riding to view party vote distribution.</p>;
	}

	return (
		<div className="riding-bar-chart">
			<div className="riding-chart-meta">
				<h4>{riding.name}</h4>
				<p className="muted">
					Code: {riding.code} {riding.subnational ? `| ${riding.subnational}` : ''}
				</p>
			</div>
			<div style={{ width: '100%', height: 240 }}>
				<ResponsiveContainer>
					<BarChart data={data} margin={{ top: 10, right: 10, left: 2, bottom: 10 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis allowDecimals={false} />
						<Tooltip content={<RidingTooltip ridingName={riding.name} />} />
						<Bar dataKey="votes">
							{data.map((row) => (
								<Cell key={row.party} fill={getPartyColor(row.party)} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
