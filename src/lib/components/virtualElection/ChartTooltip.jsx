'use client';

/**
 * Shared Recharts custom tooltip wrapper.
 *
 * Handles the active/payload guard and provides the styled container.
 * Pass a render-function as `children` to customise the body:
 *
 *   <Tooltip content={
 *     <ChartTooltip>
 *       {(row) => (
 *         <>
 *           <div>{row.name}</div>
 *           <div>Votes: {row.votes}</div>
 *         </>
 *       )}
 *     </ChartTooltip>
 *   } />
 */
export default function ChartTooltip({ active, payload, children }) {
	if (!active || !payload?.length) return null;
	const row = payload[0]?.payload;
	if (!row) return null;
	return (
		<div className="region-vote-tooltip">
			{typeof children === 'function' ? children(row) : children}
		</div>
	);
}
