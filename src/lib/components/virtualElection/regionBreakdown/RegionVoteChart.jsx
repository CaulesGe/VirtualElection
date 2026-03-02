'use client';

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	LabelList,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts';
import { getPartyColor, getPartyShortName } from '@/lib/components/virtualElection/partyMeta';

function VoteTooltip({ active, payload }) {
	if (!active || !payload?.length) return null;
	const row = payload[0]?.payload;
	if (!row) return null;
	return (
		<div className="region-vote-tooltip">
			<div style={{ color: getPartyColor(row.party), fontWeight: 700 }}>{row.name}</div>
			<div>Votes: {row.numberOfVote}</div>
			<div>Share: {row.percentageOfVote}%</div>
		</div>
	);
}

export default function RegionVoteChart({ voteSeries, mode = 'bar' }) {
	const data = Object.values(voteSeries)
		.map((row) => ({
			...row,
			name: getPartyShortName(row.party)
		}))
		.sort((a, b) => b.numberOfVote - a.numberOfVote);

	if (mode === 'pie') {
		return (
			<div style={{ width: '100%', height: 300, minHeight: 240 }}>
				<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
					<PieChart>
						<Pie
							data={data}
							dataKey="numberOfVote"
							nameKey="name"
							cx="50%"
							cy="50%"
							outerRadius={100}
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
						>
							{data.map((row) => (
								<Cell key={row.party} fill={getPartyColor(row.party)} />
							))}
						</Pie>
						<Tooltip content={<VoteTooltip />} />
					</PieChart>
				</ResponsiveContainer>
			</div>
		);
	}

	return (
		<div style={{ width: '100%', height: 300, minHeight: 240 }}>
			<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
				<BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 16 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="name"
						angle={-25}
						textAnchor="end"
						height={60}
						tick={(props) => {
							const row = data.find((item) => item.name === props.payload.value);
							return (
								<text
									x={props.x}
									y={props.y}
									dy={16}
									textAnchor="end"
									transform={`rotate(-25 ${props.x} ${props.y})`}
									fill={row ? getPartyColor(row.party) : '#1f2937'}
								>
									{props.payload.value}
								</text>
							);
						}}
					/>
					<YAxis tickFormatter={(value) => `${value}%`} />
					<Tooltip content={<VoteTooltip />} />
					<Bar dataKey="percentageOfVote">
						{data.map((row) => (
							<Cell key={row.party} fill={getPartyColor(row.party)} />
						))}
						<LabelList
							dataKey="percentageOfVote"
							position="top"
							formatter={(v) => `${v}%`}
							style={{ fontWeight: 600, fontSize: 12 }}
							content={({ x, y, width, value, index }) => {
								const row = data[index];
								return (
									<text
										x={x + width / 2}
										y={y - 6}
										textAnchor="middle"
										fill={row ? getPartyColor(row.party) : '#1f2937'}
										fontWeight={600}
										fontSize={12}
									>
										{value}%
									</text>
								);
							}}
						/>
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
