'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { getPartyShortName } from '@/lib/components/virtualElection/partyMeta';

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
	onPartyChange,
	onSubmitVote
}) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const queryString = searchParams?.toString();
	const callbackUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
	const canVote = isAuthenticated && !!selectedRiding && !!selectedParty && !isSubmitting;
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
							Current vote: <strong>{getPartyShortName(userVote.party ?? '')}</strong> in riding{' '}
							<strong>
								{currentVoteRiding?.name ?? userVote.ridingId} ({userVote.ridingId})
							</strong>
						</p>
					) : null}

					{selectedRiding ? (
						<p className="selected-riding">
							Selected riding: <strong>{selectedRiding.name}</strong> ({selectedRiding.code})
						</p>
					) : null}

					<label htmlFor="party-select">Select Party</label>
					<select id="party-select" value={selectedParty} onChange={(e) => onPartyChange(e.target.value)}>
						<option value="">Choose one</option>
						{allowedParties.map((party) => (
							<option key={party} value={party}>
								{getPartyShortName(party)}
							</option>
						))}
					</select>

					<button type="button" disabled={!canVote} onClick={onSubmitVote}>
						{isSubmitting ? 'Submitting...' : voteActionLabel}
					</button>
				</>
			)}

			{errorMessage ? <p className="error">{errorMessage}</p> : null}
		</section>
	);
}
