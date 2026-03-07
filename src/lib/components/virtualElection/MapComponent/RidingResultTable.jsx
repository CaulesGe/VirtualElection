'use client';

import { useMemo } from 'react';
import { getPartyColor, getPartyShortName } from '@/lib/components/virtualElection/partyMeta';
import styles from '@/lib/components/virtualElection/VirtualElectionPage.module.css';

export default function RidingResultTable({
	selectedRiding = null,
	selectedRidingTotals = null,
	allowedParties = []
}) {
	const sortedRows = useMemo(() => {
		const rows = (allowedParties ?? []).map((party) => ({
			party,
			votes: Number(selectedRidingTotals?.totals?.[party] ?? 0)
		}));

		rows.sort((a, b) => b.votes - a.votes || a.party.localeCompare(b.party));
		return rows;
	}, [allowedParties, selectedRidingTotals?.totals]);

	const bodyClassName = `${styles.totalsCardBody} ${selectedRiding ? styles.totalsCardBodyExpanded : ''}`;

	return (
		<section className={styles.totalsCard}>
			<h3>Selected Riding Live Totals</h3>
			<div className={bodyClassName}>
				{!selectedRiding ? (
					<p className="muted">Select a riding to view totals.</p>
				) : (
					<>
						<p className="muted">
							{selectedRidingTotals ? (
								<>
									Leader: <strong>{getPartyShortName(selectedRidingTotals.leader)}</strong> (
									{(selectedRidingTotals.intensity * 100).toFixed(1)}%)
								</>
							) : (
								'No votes recorded for this riding yet.'
							)}
						</p>
						<div className={styles.partyTotals}>
							{sortedRows.map((row) => (
								<div className={styles.totalsRow} key={row.party}>
									<span style={{ color: getPartyColor(row.party), fontWeight: 600 }}>
										{getPartyShortName(row.party)}
									</span>
									<strong>{row.votes}</strong>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</section>
	);
}
