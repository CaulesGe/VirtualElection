'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { VIRTUAL_ELECTION_ALLOWED_SCOPES } from '@/lib/config/virtualElection';
import LoginControl from '@/lib/components/virtualElection/LoginControl';
import MapController from '@/lib/components/virtualElection/MapComponent/MapController';
import { getPartyColor, getPartyShortName } from '@/lib/components/virtualElection/partyMeta';
import useElectionState from '@/lib/components/virtualElection/useElectionState';
import styles from './VirtualElectionPage.module.css';

const RegionChartController = dynamic(
	() => import('@/lib/components/virtualElection/regionBreakdown/RegionChartController'),
	{ ssr: false }
);

export default function VirtualElectionPage({
	session,
	scope = VIRTUAL_ELECTION_ALLOWED_SCOPES[0],
	initialTotals = [],
	initialMe = { voted: false },
	initialRidings = [],
	mapMetadata,
	renderTopContent
}) {
	const {
		selectedRiding,
		setSelectedRiding,
		selectedParty,
		setSelectedParty,
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
		submitVote
	} = useElectionState({ scope, initialTotals, initialMe, initialRidings, mapMetadata });

	const isAuthenticated = !!session?.user;
	const sessionUserLabel = session?.user?.name || session?.user?.email || '';

	const isUsaScope = String(scope?.country ?? '').toLowerCase() === 'us';
	const usaIsPresident = String(scope?.district ?? '').toLowerCase() === 'pres';
	const countryTitle = useMemo(() => {
		const code = String(activeMapMetadata?.countryCode ?? scope?.country ?? '').toUpperCase();
		const district = String(scope?.district ?? '').toLowerCase();
		if (code === 'US') {
			if (district === 'pres') return 'USA - Presidential Election';
			if (district === 'fed') return 'USA - House of Representatives';
			return 'USA';
		}
		if (code === 'CA') return 'Canada';
		return code || 'Virtual Election';
	}, [activeMapMetadata?.countryCode, scope?.country, scope?.district]);

	return (
		<div className={styles.page}>
			<header>
				<div className={styles.titleRow}>
					<h1>{countryTitle}</h1>
					{isUsaScope ? (
						<section className={styles.officeSwitcher} aria-label="Switch USA election office">
							<Link href="/usa/president" className={usaIsPresident ? 'active' : ''}>
								President
							</Link>
							<Link href="/usa/houseOfRepresentatives" className={!usaIsPresident ? 'active' : ''}>
								House of Representatives
							</Link>
						</section>
					) : null}
				</div>
				<h2 className={styles.receivedLine}>
					{totalVotesReceived} vote{totalVotesReceived === 1 ? '' : 's'} have received so far.
				</h2>
			</header>
			{typeof renderTopContent === 'function'
				? renderTopContent({
						scope,
						totals,
						ridingResults,
						mapMetadata: activeMapMetadata
					})
				: null}

			<RegionChartController
				totals={totals}
				ridingResults={ridingResults}
				countryCode={activeMapMetadata?.countryCode ?? String(scope?.country ?? 'ca').toUpperCase()}
				mode={activeMapMetadata?.mode}
			/>

			<section className={styles.layoutGrid}>
				<div>
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
				<div className={styles.rightPanel}>
					<LoginControl
						allowedParties={allowedParties}
						selectedParty={selectedParty}
						selectedRiding={selectedRiding}
						ridingResults={ridingResults}
						userVote={userVote}
						isAuthenticated={isAuthenticated}
						userLabel={sessionUserLabel}
						isSubmitting={isSubmitting}
						errorMessage={errorMessage}
						onPartyChange={(party) => {
							setSelectedParty(party);
							setErrorMessage('');
						}}
						onSubmitVote={submitVote}
					/>

					<section className={styles.totalsCard}>
						<h3>Selected Riding Live Totals</h3>
						<div className={styles.totalsCardBody}>
							{!selectedRiding ? (
								<p className="muted">Select a riding to view totals.</p>
							) : (
								<>
									<p className="muted">
										{selectedRidingTotals ? (
											<>
												Leader: <strong>{selectedRidingTotals.leader}</strong> (
												{(selectedRidingTotals.intensity * 100).toFixed(1)}%)
											</>
										) : (
											'No votes recorded for this riding yet.'
										)}
									</p>
									<div className={styles.partyTotals}>
										{allowedParties.map((party) => (
											<div className={styles.totalsRow} key={party}>
												<span style={{ color: getPartyColor(party), fontWeight: 600 }}>
													{getPartyShortName(party)}
												</span>
												<strong>{selectedRidingTotals?.totals?.[party] ?? 0}</strong>
											</div>
										))}
									</div>
								</>
							)}
						</div>
					</section>

					<section className={styles.totalsCard}>
						<h3>Map Legend</h3>
						<div className={styles.legendList}>
							{allowedParties.map((party) => (
								<div className={styles.legendRow} key={party}>
									<span className={styles.swatch} style={{ background: getPartyColor(party) }} />
									<span>{getPartyShortName(party)}</span>
								</div>
							))}
							<div className={styles.legendRow}>
								<span className={styles.swatch} style={{ background: '#d1d5db' }} />
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
