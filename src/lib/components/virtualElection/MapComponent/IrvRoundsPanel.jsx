'use client';

import { useEffect, useMemo, useState } from 'react';
import { getPartyColor, getPartyShortName } from '@/lib/components/virtualElection/partyMeta';
import styles from './IrvRoundsPanel.module.css';

/**
 * Round-by-round preferential count for the selected division.
 * `revision` changes whenever the totals or the user's own ballot change so the
 * result is re-fetched (and shared caches are bypassed) only when data moved.
 */
export default function IrvRoundsPanel({ scope, selectedRiding = null, revision = '' }) {
	const [result, setResult] = useState(null);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const ridingId = selectedRiding ? String(selectedRiding.code) : '';
	const { country, district, year } = scope;

	useEffect(() => {
		if (!ridingId) return undefined;
		let cancelled = false;
		async function load() {
			setLoading(true);
			setError('');
			try {
				const query = new URLSearchParams({
					country,
					district,
					year: String(year),
					ridingId,
					rev: String(revision)
				});
				const response = await fetch(`/api/virtual-election/irv?${query}`);
				const payload = await response.json();
				if (!response.ok) throw new Error(payload?.error || 'Failed to load preference count.');
				if (!cancelled) setResult(payload);
			} catch (loadError) {
				if (!cancelled) {
					setResult(null);
					setError(loadError instanceof Error ? loadError.message : 'Failed to load preference count.');
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		void load();
		return () => {
			cancelled = true;
		};
	}, [ridingId, country, district, year, revision]);

	const visibleResult = ridingId && result?.ridingId === ridingId ? result : null;

	const parties = useMemo(() => {
		const seen = [];
		for (const round of visibleResult?.rounds ?? []) {
			for (const party of Object.keys(round.counts ?? {})) {
				if (!seen.includes(party)) seen.push(party);
			}
		}
		const firstRound = visibleResult?.rounds?.[0]?.counts ?? {};
		return seen.sort((a, b) => (firstRound[b] ?? 0) - (firstRound[a] ?? 0) || a.localeCompare(b));
	}, [visibleResult]);

	return (
		<section className={styles.panel}>
			<h3>Preference Count (IRV)</h3>
			{!ridingId ? (
				<p className="muted">Select a division to see how preferences are distributed.</p>
			) : error ? (
				<p className="error">{error}</p>
			) : !visibleResult ? (
				<p className="muted">{loading ? 'Loading preference count…' : 'No data yet.'}</p>
			) : visibleResult.totalBallots === 0 ? (
				<p className="muted">No ballots recorded for this division yet.</p>
			) : (
				<>
					<p className="muted">
						Winner: <strong>{getPartyShortName(visibleResult.winner)}</strong>
						{visibleResult.finalTwo.length === 2 ? (
							<>
								{' '}
								({visibleResult.finalTwo[0].votes} to {visibleResult.finalTwo[1].votes} against{' '}
								{getPartyShortName(visibleResult.finalTwo[1].party)})
							</>
						) : null}
					</p>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th scope="col">Party</th>
									{visibleResult.rounds.map((round) => (
										<th scope="col" key={round.round}>
											{round.round === 1 ? '1st pref.' : `Round ${round.round}`}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{parties.map((party) => (
									<tr key={party}>
										<th scope="row">
											<span className={styles.swatch} style={{ background: getPartyColor(party) }} />
											{getPartyShortName(party)}
										</th>
										{visibleResult.rounds.map((round) => {
											const votes = round.counts?.[party];
											const isEliminated = round.eliminated === party;
											const isWinner =
												round.eliminated === null && visibleResult.winner === party;
											return (
												<td
													key={round.round}
													className={`${isEliminated ? styles.eliminated : ''} ${isWinner ? styles.winner : ''}`}
													title={isEliminated ? 'Eliminated after this round' : undefined}
												>
													{votes === undefined ? '–' : votes}
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className={styles.note}>
						Struck-through counts mark the party eliminated at the end of that round; its ballots move
						to each voter&apos;s next remaining preference.
					</p>
				</>
			)}
		</section>
	);
}
