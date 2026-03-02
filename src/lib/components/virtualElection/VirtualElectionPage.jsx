'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	VIRTUAL_ELECTION_ALLOWED_PARTIES,
	VIRTUAL_ELECTION_ALLOWED_SCOPES
} from '@/lib/config/virtualElection';
import RegionChartController from '@/lib/components/virtualElection/regionBreakdown/RegionChartController';
import VirtualElectionControls from '@/lib/components/virtualElection/VirtualElectionControls';
import MapController from '@/lib/components/virtualElection/MapComponent/MapController';
import { getPartyColor, getPartyShortName } from '@/lib/components/virtualElection/partyMeta';

export default function VirtualElectionPage({
	session,
	scope = VIRTUAL_ELECTION_ALLOWED_SCOPES[0],
	initialTotals = [],
	initialMe = { voted: false },
	initialRidings = [],
	mapMetadata
}) {
	const [selectedRiding, setSelectedRiding] = useState(null);
	const [selectedParty, setSelectedParty] = useState('');
	const [userVote, setUserVote] = useState(initialMe);
	const [totals, setTotals] = useState(initialTotals);
	const [errorMessage, setErrorMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [ridingResults, setRidingResults] = useState(initialRidings);
	const [allowedParties, setAllowedParties] = useState(VIRTUAL_ELECTION_ALLOWED_PARTIES);
	const [activeMapMetadata, setActiveMapMetadata] = useState(mapMetadata);

	const isAuthenticated = !!session?.user;
	const sessionUserLabel = session?.user?.name || session?.user?.email || '';

	useEffect(() => {
		setUserVote(initialMe);
		setTotals(initialTotals);
		setRidingResults(initialRidings);
	}, [initialMe, initialTotals, initialRidings]);

	useEffect(() => {
		let cancelled = false;
		async function loadOptions() {
			const query = new URLSearchParams({
				country: scope.country,
				district: scope.district,
				year: String(scope.year)
			});
			try {
				const response = await fetch(`/api/virtual-election/options?${query}`);
				if (!response.ok) return;
				const payload = await response.json();
				if (cancelled) return;
				if (Array.isArray(payload?.allowedParties) && payload.allowedParties.length > 0) {
					setAllowedParties(payload.allowedParties);
				}
				if (Array.isArray(payload?.ridings) && payload.ridings.length > 0) {
					setRidingResults(payload.ridings);
				}
				if (payload?.countryCode && payload?.mapVersion) {
					setActiveMapMetadata({
						countryCode: payload.countryCode,
						mapVersion: payload.mapVersion
					});
				}
			} catch {
				// Keep safe local defaults if options fetch fails.
			}
		}
		void loadOptions();
		return () => {
			cancelled = true;
		};
	}, [scope.country, scope.district, scope.year]);

	const refreshTotals = useCallback(async () => {
		const query = new URLSearchParams({
			country: scope.country,
			district: scope.district,
			year: String(scope.year)
		});
		const response = await fetch(`/api/virtual-election/totals?${query}`);
		if (!response.ok) throw new Error('Failed to refresh totals');
		const payload = await response.json();
		setTotals(payload.ridings ?? []);
	}, [scope.country, scope.district, scope.year]);

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			void refreshTotals();
		}, 15_000);
		return () => window.clearInterval(intervalId);
	}, [refreshTotals]);

	async function submitVoteInternal(riding, party) {
		if (isSubmitting) return;

		const isOverwrite =
			userVote.voted &&
			(String(userVote.ridingId ?? '') !== String(riding.code) ||
				String(userVote.party ?? '') !== String(party));
		if (isOverwrite) {
			const confirmed = window.confirm(
				'Are you going to have another vote? Original vote will be overwritten.'
			);
			if (!confirmed) return;
		}

		setIsSubmitting(true);
		setErrorMessage('');
		try {
			const response = await fetch('/api/virtual-election/vote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ridingId: String(riding.code),
					party,
					country: scope.country,
					district: scope.district,
					year: scope.year
				})
			});
			const payload = await response.json();
			if (!response.ok) {
				setErrorMessage(payload?.error || 'Vote failed.');
				return;
			}
			setUserVote(payload.me ?? userVote);
			setSelectedRiding(riding);
			setSelectedParty(party);
			await refreshTotals();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Vote failed.');
		} finally {
			setIsSubmitting(false);
		}
	}

	async function submitVote() {
		if (!selectedRiding || !selectedParty || isSubmitting) return;
		await submitVoteInternal(selectedRiding, selectedParty);
	}

	const selectedRidingTotals = useMemo(() => {
		if (!selectedRiding) return null;
		return totals.find((row) => String(row.ridingId) === String(selectedRiding.code)) ?? null;
	}, [selectedRiding, totals]);

	const totalVotesReceived = useMemo(
		() => totals.reduce((sum, row) => sum + (row.totalVotes ?? 0), 0),
		[totals]
	);

	return (
		<div className="virtual-election-page">
			<header>
				<h1>Virtual Election 2026</h1>
				<p>Don&apos;t believe the poll? Show us your vote!</p>
				<h2 className="received-line">
					{totalVotesReceived} vote{totalVotesReceived === 1 ? '' : 's'} have received so far.
				</h2>
			</header>

			<RegionChartController totals={totals} ridingResults={ridingResults} />

			<section className="layout-grid">
				<div className="left-panel">
					<MapController
						ridingResults={ridingResults}
						virtualTotals={totals}
						selectedRiding={selectedRiding}
						mapMetadata={activeMapMetadata}
						onSelectRiding={(riding) => {
							setSelectedRiding(riding);
							setErrorMessage('');
						}}
					/>
				</div>
				<div className="right-panel">
					<VirtualElectionControls
						allowedParties={allowedParties}
						selectedParty={selectedParty}
						selectedRiding={selectedRiding}
						userVote={userVote}
						isAuthenticated={isAuthenticated}
						userLabel={sessionUserLabel}
						isSubmitting={isSubmitting}
						errorMessage={errorMessage}
						scope={scope}
						onPartyChange={(party) => {
							setSelectedParty(party);
							setErrorMessage('');
						}}
						onSubmitVote={submitVote}
					/>

					<section className="totals-card">
						<h3>Selected Riding Live Totals</h3>
						{!selectedRiding ? (
							<p className="muted">Select a riding to view totals.</p>
						) : !selectedRidingTotals ? (
							<p className="muted">No virtual votes recorded for this riding yet.</p>
						) : (
							<>
								<p className="muted">
									Leader: <strong>{selectedRidingTotals.leader}</strong> (
									{(selectedRidingTotals.intensity * 100).toFixed(1)}%)
								</p>
								<div className="party-totals">
									{Object.entries(selectedRidingTotals.totals).map(([party, votes]) => (
										<div className="row" key={party}>
											<span>{getPartyShortName(party)}</span>
											<strong>{votes}</strong>
										</div>
									))}
								</div>
							</>
						)}
					</section>

					<section className="totals-card">
						<h3>Map Legend</h3>
						<div className="legend-list">
							{allowedParties.map((party) => (
								<div className="legend-row" key={party}>
									<span className="swatch" style={{ background: getPartyColor(party) }} />
									<span>{getPartyShortName(party)}</span>
								</div>
							))}
							<div className="legend-row">
								<span className="swatch" style={{ background: '#d1d5db' }} />
								<span>No Votes Yet</span>
							</div>
						</div>
						<p className="muted">Color intensity reflects leader share in each riding.</p>
					</section>
				</div>
			</section>
		</div>
	);
}
