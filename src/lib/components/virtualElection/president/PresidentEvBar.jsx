'use client';

import { getPartyColor } from '@/lib/components/virtualElection/partyMeta';

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
		<section className="president-ev-card">
			<div className="president-ev-header">
				<h3>Electoral Vote Projection</h3>
				<p className="muted">Tied states are treated as uncalled.</p>
			</div>
			<div className="president-ev-bar-wrap">
				<div className="president-ev-threshold" style={{ left: markerLeft }} />
				<div className="president-ev-threshold-label" style={{ left: markerLeft }}>
					Need {threshold}
				</div>
				<div className="president-ev-bar" role="img" aria-label="Presidential electoral vote bar">
					<div
						className="president-ev-segment president-ev-segment-left"
						style={{ width: `${demWidth}%`, backgroundColor: getPartyColor('DEM') }}
						title={`DEM: ${demEv} EV`}
					/>
					<div
						className="president-ev-segment president-ev-segment-right"
						style={{ width: `${repWidth}%`, backgroundColor: getPartyColor('REP') }}
						title={`REP: ${repEv} EV`}
					/>
					{indWidth > 0 ? (
						<div
							className="president-ev-segment president-ev-segment-center"
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
			<div className="president-party-columns">
				<div className="president-party-col left" style={{ color: getPartyColor('DEM') }}>
					<p className="president-party-ev">DEM {demEv}</p>
					<p className="president-party-popular">
						{demPopularPct.toFixed(1)}% of popular vote
						<br />({formatVotes(demPopularVotes)} votes)
						<br />Needs {needsByParty?.DEM ?? 0} to win
					</p>
				</div>
				<div className="president-party-col center" style={{ color: getPartyColor('IND') }}>
					<p className="president-party-ev">IND {indEv}</p>
					<p className="president-party-popular">
						{indPopularPct.toFixed(1)}% of popular vote
						<br />({formatVotes(indPopularVotes)} votes)
						<br />Needs {needsByParty?.IND ?? 0} to win
					</p>
				</div>
				<div className="president-party-col right" style={{ color: getPartyColor('REP') }}>
					<p className="president-party-ev">REP {repEv}</p>
					<p className="president-party-popular">
						{repPopularPct.toFixed(1)}% of popular vote
						<br />({formatVotes(repPopularVotes)} votes)
						<br />Needs {needsByParty?.REP ?? 0} to win
					</p>
				</div>
			</div>
			<p className="president-ev-summary">Uncalled {uncalledEv}</p>
		</section>
	);
}
