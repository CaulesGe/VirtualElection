'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { aggregateEvByStateWinners } from '@/lib/components/virtualElection/president/evAggregator';

const PresidentEvBar = dynamic(
	() => import('@/lib/components/virtualElection/president/PresidentEvBar'),
	{ ssr: false }
);

export default function UsaPresidentView(props) {
	const renderTopContent = useMemo(
		() =>
			function renderPresidentialTopContent({ totals, ridingResults }) {
				const ev = aggregateEvByStateWinners({
					districtRows: ridingResults,
					virtualTotals: totals
				});
				return (
					<PresidentEvBar
						evByParty={ev.evByParty}
						uncalledEv={ev.uncalledEv}
						totalEv={ev.totalEv}
						threshold={ev.threshold}
						needsByParty={ev.needsByParty}
						popularVotesByParty={ev.popularVotesByParty}
						popularVotePctByParty={ev.popularVotePctByParty}
					/>
				);
			},
		[]
	);

	return <VirtualElectionPage {...props} renderTopContent={renderTopContent} />;
}
