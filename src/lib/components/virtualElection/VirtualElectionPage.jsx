'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getElectionCountry, getElectionSite } from '@/lib/config/electionCountries';
import { VIRTUAL_ELECTION_ALLOWED_SCOPES } from '@/lib/config/virtualElection';
import LoginControl from '@/lib/components/virtualElection/LoginControl';
import MapController from '@/lib/components/virtualElection/MapComponent/MapController';
import IrvRoundsPanel from '@/lib/components/virtualElection/MapComponent/IrvRoundsPanel';
import RidingResultTable from '@/lib/components/virtualElection/MapComponent/RidingResultTable';
import { getPartyColor, getPartyFullName } from '@/lib/components/virtualElection/partyMeta';
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
		submitVote
	} = useElectionState({ scope, initialTotals, initialMe, initialRidings, mapMetadata });

	const isAuthenticated = !!session?.user;
	const sessionUserLabel = session?.user?.name || session?.user?.email || '';

	const isUsaScope = String(scope?.country ?? '').toLowerCase() === 'us';
	const usaIsPresident = String(scope?.district ?? '').toLowerCase() === 'pres';
	const countryTitle = useMemo(() => {
		const site = getElectionSite(scope);
		if (site) return site.pageTitle;
		const code = String(activeMapMetadata?.countryCode ?? scope?.country ?? '').toUpperCase();
		return getElectionCountry(code)?.name ?? (code || 'Virtual Election');
	}, [activeMapMetadata?.countryCode, scope]);

	return (
		<div className={styles.page}>
			<header>
				<div className={styles.titleRow}>
					<h1>{countryTitle}</h1>
					{isUsaScope ? (
						<nav className={styles.officeToggle} aria-label="Switch USA election office">
							<Link
								href="/usa/president"
								className={`${styles.officeToggleOption} ${usaIsPresident ? styles.officeToggleOptionActive : ''}`}
								aria-current={usaIsPresident ? 'page' : undefined}
							>
								President
							</Link>
							<Link
								href="/usa/houseOfRepresentatives"
								className={`${styles.officeToggleOption} ${!usaIsPresident ? styles.officeToggleOptionActive : ''}`}
								aria-current={!usaIsPresident ? 'page' : undefined}
							>
								House of Representatives
							</Link>
						</nav>
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
						isPreferential={isPreferential}
						selectedRanking={selectedRanking}
						onRankingChange={(ranking) => {
							setSelectedRanking(ranking);
							setErrorMessage('');
						}}
						onPartyChange={(party) => {
							setSelectedParty(party);
							setErrorMessage('');
						}}
						onSubmitVote={submitVote}
					/>

					<RidingResultTable
						selectedRiding={selectedRiding}
						selectedRidingTotals={selectedRidingTotals}
						allowedParties={allowedParties}
						isPreferential={isPreferential}
					/>

					{isPreferential ? (
						<IrvRoundsPanel
							scope={scope}
							selectedRiding={selectedRiding}
							revision={`${selectedRidingTotals?.totalVotes ?? 0}|${JSON.stringify(
								selectedRidingTotals?.irv?.finalTwo ?? []
							)}|${(userVote?.ranking ?? []).join('>')}`}
						/>
					) : null}

					<section className={styles.totalsCard}>
						<h3>Map Legend</h3>
						<div className={styles.legendList}>
							{allowedParties.map((party) => (
								<div className={styles.legendRow} key={party}>
									<span className={styles.swatch} style={{ background: getPartyColor(party) }} />
									<span>{getPartyFullName(party)}</span>
								</div>
							))}
							<div className={styles.legendRow}>
								<span className={styles.swatch} style={{ background: '#d1d5db' }} />
								<span>No Votes Yet</span>
							</div>
						</div>
						<p className="muted">
							{isPreferential
								? 'Colors show each division\u2019s projected winner after preferences; intensity reflects the winner\u2019s share in the final count.'
								: 'Color intensity reflects leader share in each riding.'}
						</p>
					</section>
				</div>
			</section>
		</div>
	);
}
