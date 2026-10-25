'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import RankedBallot from '@/lib/components/virtualElection/RankedBallot';
import {
	getPartyColor,
	getPartyFullName,
	getPartyShortName
} from '@/lib/components/virtualElection/partyMeta';

// Party code rendered in the party's own color.
function PartyCode({ party }) {
	return (
		<strong style={{ color: getPartyColor(party) }} title={getPartyFullName(party)}>
			{getPartyShortName(party)}
		</strong>
	);
}

export default function LoginControl({
	allowedParties,
	selectedParty,
	selectedRiding,
	ridingResults = [],
	userVote,
	isAuthenticated,
	userLabel,
	isSubmitting,
	errorMessage,
	isPreferential = false,
	selectedRanking = [],
	onRankingChange,
	onPartyChange,
	onSubmitVote
}) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const queryString = searchParams?.toString();
	const callbackUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
	const hasChoice = isPreferential
		? selectedRanking.length > 0 && selectedRanking.length === allowedParties.length
		: !!selectedParty;
	const canVote = isAuthenticated && !!selectedRiding && hasChoice && !isSubmitting;
	const voteActionLabel = userVote?.voted ? 'Update Vote' : 'Cast Vote';
	const currentVoteRiding =
		userVote?.ridingId
			? ridingResults.find((riding) => String(riding?.code) === String(userVote.ridingId)) ?? null
			: null;

	return (
		<section className="controls-card">
			<h3>Vote Controls</h3>
			<div className="auth-status">
				<span className={`dot ${isAuthenticated ? 'online' : 'offline'}`} />
				<span>{isAuthenticated ? `Signed in${userLabel ? ` as ${userLabel}` : ''}` : 'Not signed in'}</span>
				{isAuthenticated ? (
					<a className="signout-link" href={`/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
						Sign out
					</a>
				) : null}
			</div>

			{!isAuthenticated ? (
				<>
					<p className="muted">You can browse totals, but you must sign in to cast a vote.</p>
					<a
						className="auth-btn"
						href={`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
					>
						Sign in with Google
					</a>
				</>
			) : (
				<>
					{userVote?.voted ? (
						<p className="vote-state">
							{isPreferential ? 'Current vote: first preference ' : 'Current vote: '}
							<PartyCode party={userVote.party ?? ''} /> in riding{' '}
							<strong>
								{currentVoteRiding?.name ?? userVote.ridingId} ({userVote.ridingId})
							</strong>
							{isPreferential && Array.isArray(userVote.ranking) && userVote.ranking.length > 1 ? (
								<>
									{' '}
									(ranking:{' '}
									{userVote.ranking.map((party, index) => (
										<span key={party}>
											{index > 0 ? ' > ' : ''}
											<PartyCode party={party} />
										</span>
									))}
									)
								</>
							) : null}
						</p>
					) : null}

					{selectedRiding ? (
						<p className="selected-riding">
							Selected riding: <strong>{selectedRiding.name}</strong> ({selectedRiding.code})
						</p>
					) : null}

					{isPreferential ? (
						<RankedBallot
							ranking={selectedRanking}
							defaultOrder={allowedParties}
							disabled={isSubmitting}
							onChange={onRankingChange}
						/>
					) : (
						<>
							<label htmlFor="party-select">Select Party</label>
							<select id="party-select" value={selectedParty} onChange={(e) => onPartyChange(e.target.value)}>
								<option value="">Choose one</option>
								{allowedParties.map((party) => (
									<option key={party} value={party}>
										{getPartyFullName(party)}
									</option>
								))}
							</select>
						</>
					)}

					<button type="button" disabled={!canVote} onClick={onSubmitVote}>
						{isSubmitting ? 'Submitting...' : voteActionLabel}
					</button>
				</>
			)}

			{errorMessage ? <p className="error">{errorMessage}</p> : null}
		</section>
	);
}
