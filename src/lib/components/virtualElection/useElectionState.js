'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	VIRTUAL_ELECTION_ALLOWED_SCOPES,
	getAllowedPartiesForScope,
	isPreferentialScope
} from '@/lib/config/virtualElection';
import { isCompleteRanking } from '@/lib/virtualElection/irv';

/**
 * Custom hook that owns all election state: totals polling, user vote,
 * allowed parties, riding results, and active map metadata.
 *
 * Keeps VirtualElectionPage as a thin shell that wires hook output to UI.
 */
export default function useElectionState({
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
	const [allowedParties, setAllowedParties] = useState(() => getAllowedPartiesForScope(scope));
	const [activeMapMetadata, setActiveMapMetadata] = useState(mapMetadata);
	// Ranked ballot (preferential scopes such as Australia): ordered list of every allowed party.
	const isPreferential = isPreferentialScope(scope);
	const [selectedRanking, setSelectedRanking] = useState(() =>
		isPreferential
			? isCompleteRanking(initialMe?.ranking, getAllowedPartiesForScope(scope))
				? initialMe.ranking
				: getAllowedPartiesForScope(scope)
			: []
	);

	// Sync with server-side props when they change
	useEffect(() => {
		setUserVote(initialMe);
		setTotals(initialTotals);
		setRidingResults(initialRidings);
	}, [initialMe, initialTotals, initialRidings]);

	// Keep the ranked ballot aligned with the saved vote and the allowed party list.
	useEffect(() => {
		if (!isPreferential) return;
		setSelectedRanking((previous) => {
			if (isCompleteRanking(userVote?.ranking, allowedParties)) return userVote.ranking;
			return isCompleteRanking(previous, allowedParties) ? previous : allowedParties;
		});
	}, [isPreferential, userVote?.ranking, allowedParties]);

	// Fetch authoritative election options from backend on mount
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
					setActiveMapMetadata((prev) => ({
						...prev,
						countryCode: payload.countryCode,
						mapVersion: payload.mapVersion,
						mode: payload.mode,
						regionKey: payload.regionKey,
						allocationRule: payload.allocationRule,
						electoralVotesVersion: payload.electoralVotesVersion,
						votingSystem: payload.votingSystem
					}));
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

	// Refresh totals from backend
	const refreshTotals = useCallback(async ({ fresh = false } = {}) => {
		const query = new URLSearchParams({
			country: scope.country,
			district: scope.district,
			year: String(scope.year)
		});
		// Right after voting, bypass shared caches so the voter sees their own vote immediately.
		if (fresh) query.set('fresh', String(Date.now()));
		const response = await fetch(
			`/api/virtual-election/totals?${query}`,
			fresh ? { cache: 'no-store' } : undefined
		);
		if (!response.ok) throw new Error('Failed to refresh totals');
		const payload = await response.json();
		setTotals(payload.ridings ?? []);
	}, [scope.country, scope.district, scope.year]);

	// Poll totals on interval
	useEffect(() => {
		const intervalId = window.setInterval(() => {
			void refreshTotals();
		}, 60_000);
		return () => window.clearInterval(intervalId);
	}, [refreshTotals]);

	// Submit vote logic
	async function submitVoteInternal(riding, party, ranking = null) {
		if (isSubmitting) return;

		const previousRankingKey = Array.isArray(userVote.ranking) ? userVote.ranking.join('>') : '';
		const isOverwrite =
			userVote.voted &&
			(String(userVote.ridingId ?? '') !== String(riding.code) ||
				(ranking
					? previousRankingKey !== ranking.join('>')
					: String(userVote.party ?? '') !== String(party)));
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
					...(ranking ? { ranking } : { party }),
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
			await refreshTotals({ fresh: true });
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Vote failed.');
		} finally {
			setIsSubmitting(false);
		}
	}

	async function submitVote() {
		if (isSubmitting || !selectedRiding) return;
		if (isPreferential) {
			if (!isCompleteRanking(selectedRanking, allowedParties)) return;
			await submitVoteInternal(selectedRiding, selectedRanking[0], selectedRanking);
			return;
		}
		if (!selectedParty) return;
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

	return {
		// State
		selectedRiding,
		setSelectedRiding,
		selectedParty,
		setSelectedParty,
		isPreferential,
		selectedRanking,
		setSelectedRanking,
		userVote,
		totals,
		errorMessage,
		setErrorMessage,
		isSubmitting,
		ridingResults,
		allowedParties,
		activeMapMetadata,
		selectedRidingTotals,
		totalVotesReceived,
		// Actions
		submitVote,
		refreshTotals
	};
}
