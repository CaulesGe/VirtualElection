'use client';

import { getPartyColor } from '@/lib/components/virtualElection/partyMeta';
import styles from './PresidentEvBar.module.css';

function formatVotes(value) {
	return Number(value ?? 0).toLocaleString('en-US');
}

export default function PresidentEvBar({
	evByParty,
	uncalledEv,
	totalEv,
	threshold,
	needsByParty,
	popularVotesByParty,
	popularVotePctByParty
}) {
	if (!totalEv) return null;

	const demEv = Number(evByParty?.DEM ?? 0);
	const repEv = Number(evByParty?.REP ?? 0);
	const indEv = Number(evByParty?.IND ?? 0);
	const demPopularVotes = Number(popularVotesByParty?.DEM ?? 0);
	const repPopularVotes = Number(popularVotesByParty?.REP ?? 0);
	const indPopularVotes = Number(popularVotesByParty?.IND ?? 0);
	const demPopularPct = Number(popularVotePctByParty?.DEM ?? 0);
	const repPopularPct = Number(popularVotePctByParty?.REP ?? 0);
	const indPopularPct = Number(popularVotePctByParty?.IND ?? 0);
	const demWidth = (demEv / totalEv) * 100;
	const repWidth = (repEv / totalEv) * 100;
	const indWidth = (indEv / totalEv) * 100;
	const markerLeft = `${(threshold / totalEv) * 100}%`;

	return (
		<section className={styles.card}>
			<div className={styles.header}>
				<h3>Electoral Vote Projection</h3>
				<p className="muted">Tied states are treated as uncalled.</p>
			</div>
			<div className={styles.barWrap}>
				<div className={styles.threshold} style={{ left: markerLeft }} />
				<div className={styles.thresholdLabel} style={{ left: markerLeft }}>
					Need {threshold}
				</div>
				<div className={styles.bar} role="img" aria-label="Presidential electoral vote bar">
					<div
						className={`${styles.segment} ${styles.segmentLeft}`}
						style={{ width: `${demWidth}%`, backgroundColor: getPartyColor('DEM') }}
						title={`DEM: ${demEv} EV`}
					/>
					<div
						className={`${styles.segment} ${styles.segmentRight}`}
						style={{ width: `${repWidth}%`, backgroundColor: getPartyColor('REP') }}
						title={`REP: ${repEv} EV`}
					/>
					{indWidth > 0 ? (
						<div
							className={`${styles.segment} ${styles.segmentCenter}`}
							style={{
								left: `${demWidth}%`,
								width: `${indWidth}%`,
								backgroundColor: getPartyColor('IND')
							}}
							title={`IND: ${indEv} EV`}
						/>
					) : null}
				</div>
			</div>
			<div className={styles.partyColumns}>
				<div className={styles.partyCol} style={{ color: getPartyColor('DEM') }}>
					<p className={styles.partyEv}>DEM {demEv}</p>
					<p className={styles.partyPopular}>
						{demPopularPct.toFixed(1)}% of popular vote
						<br />({formatVotes(demPopularVotes)} votes)
						<br />Needs {needsByParty?.DEM ?? 0} to win
					</p>
				</div>
				<div className={`${styles.partyCol} ${styles.partyColCenter}`} style={{ color: getPartyColor('IND') }}>
					<p className={styles.partyEv}>IND {indEv}</p>
					<p className={styles.partyPopular}>
						{indPopularPct.toFixed(1)}% of popular vote
						<br />({formatVotes(indPopularVotes)} votes)
						<br />Needs {needsByParty?.IND ?? 0} to win
					</p>
				</div>
				<div className={`${styles.partyCol} ${styles.partyColRight}`} style={{ color: getPartyColor('REP') }}>
					<p className={styles.partyEv}>REP {repEv}</p>
					<p className={styles.partyPopular}>
						{repPopularPct.toFixed(1)}% of popular vote
						<br />({formatVotes(repPopularVotes)} votes)
						<br />Needs {needsByParty?.REP ?? 0} to win
					</p>
				</div>
			</div>
			<p className={styles.summary}>Uncalled {uncalledEv}</p>
		</section>
	);
}
