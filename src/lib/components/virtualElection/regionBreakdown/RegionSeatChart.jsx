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
import ChartTooltip from '@/lib/components/virtualElection/ChartTooltip';

export default function RegionSeatChart({ seatSeries, mode = 'bar' }) {
	const data = Object.entries(seatSeries)
		.filter(([key]) => key !== 'Total')
		.map(([party, seats]) => ({
			party,
			name: getPartyShortName(party),
			seats
		}))
		.sort((a, b) => b.seats - a.seats);
	const totalSeats = Number(seatSeries?.Total ?? data.reduce((sum, row) => sum + row.seats, 0));
	const majoritySeats = totalSeats > 0 ? Math.floor(totalSeats / 2) + 1 : 0;

	if (mode === 'pie') {
		return (
			<div style={{ width: '100%', height: 300, minHeight: 240 }}>
				<p className="chart-subtitle">{majoritySeats} seats for a majority</p>
				<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
					<PieChart>
						<Pie
							data={data}
							dataKey="seats"
							nameKey="name"
							cx="50%"
							cy="50%"
							outerRadius={100}
							label={({ name, value }) => `${name} ${value}`}
						>
							{data.map((row) => (
								<Cell key={row.party} fill={getPartyColor(row.party)} />
							))}
						</Pie>
				<Tooltip content={
					<ChartTooltip>
						{(row) => (
							<>
								<div style={{ color: getPartyColor(row.party), fontWeight: 700 }}>{row.name}</div>
								<div>Seats: {row.seats}</div>
							</>
						)}
					</ChartTooltip>
				} />
			</PieChart>
				</ResponsiveContainer>
			</div>
		);
	}

	return (
		<div style={{ width: '100%', height: 300, minHeight: 240 }}>
			<p className="chart-subtitle">{majoritySeats} seats for a majority</p>
			<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
				<BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis type="number" allowDecimals={false} />
					<YAxis
						dataKey="name"
						type="category"
						width={54}
						tick={(props) => {
							const row = data.find((item) => item.name === props.payload.value);
							return (
								<text
									x={props.x}
									y={props.y}
									dy={4}
									textAnchor="end"
									fill={row ? getPartyColor(row.party) : '#1f2937'}
									fontWeight={600}
									fontSize={13}
								>
									{props.payload.value}
								</text>
							);
						}}
					/>
			<Tooltip content={
				<ChartTooltip>
					{(row) => (
						<>
							<div style={{ color: getPartyColor(row.party), fontWeight: 700 }}>{row.name}</div>
							<div>Seats: {row.seats}</div>
						</>
					)}
				</ChartTooltip>
			} />
			<Bar dataKey="seats">
						{data.map((row) => (
							<Cell key={row.party} fill={getPartyColor(row.party)} />
						))}
						<LabelList dataKey="seats" position="right" />
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
