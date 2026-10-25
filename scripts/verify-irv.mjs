import assert from 'node:assert/strict';
import {
	countIrv,
	countIrvByRiding,
	isCompleteRanking,
	parseRankingKey,
	toRankingKey
} from '../src/lib/virtualElection/irv.js';

const PARTIES = ['ALP', 'LNP', 'GRN', 'IND', 'ONP', 'AFP', 'OTH'];

function ballot(ranking, votes) {
	// Complete the ranking with the remaining parties in config order.
	const rest = PARTIES.filter((party) => !ranking.includes(party));
	return { ranking: [...ranking, ...rest], votes };
}

// 1. Empty division.
{
	const result = countIrv({ ballots: [], parties: PARTIES });
	assert.equal(result.winner, null);
	assert.equal(result.rounds.length, 0);
}

// 2. Majority on first count: a single round, no elimination.
{
	const result = countIrv({
		ballots: [ballot(['ALP', 'GRN'], 6), ballot(['LNP', 'AFP'], 4)],
		parties: PARTIES
	});
	assert.equal(result.winner, 'ALP');
	assert.equal(result.rounds.length, 1);
	assert.equal(result.rounds[0].eliminated, null);
	assert.equal(result.firstPreferenceLeader, 'ALP');
}

// 3. Documented example: LNP leads first preferences, ALP wins on preferences.
{
	const result = countIrv({
		ballots: [
			ballot(['ALP', 'GRN', 'LNP', 'ONP'], 28),
			ballot(['GRN', 'ALP', 'LNP', 'ONP'], 17),
			ballot(['LNP', 'ONP', 'ALP', 'GRN'], 30),
			ballot(['ONP', 'LNP', 'ALP', 'GRN'], 15),
			ballot(['GRN', 'ALP', 'LNP', 'ONP'], 10)
		],
		parties: PARTIES
	});
	assert.equal(result.firstPreferenceLeader, 'LNP');
	assert.equal(result.winner, 'ALP');
	assert.equal(result.rounds.length, 3);
	assert.equal(result.rounds[0].eliminated, 'ONP');
	assert.deepEqual(result.rounds[0].counts, { ALP: 28, LNP: 30, GRN: 27, ONP: 15 });
	assert.equal(result.rounds[1].eliminated, 'GRN');
	assert.deepEqual(result.rounds[1].counts, { ALP: 28, LNP: 45, GRN: 27 });
	assert.deepEqual(result.rounds[2].counts, { ALP: 55, LNP: 45 });
	assert.deepEqual(result.finalTwo, [
		{ party: 'ALP', votes: 55 },
		{ party: 'LNP', votes: 45 }
	]);
	assert.ok(Math.abs(result.winnerShare - 0.55) < 1e-9);
	assert.equal(result.exhausted, 0);
}

// 4. Tie for elimination: broken by fewer first preferences, then by later config position.
{
	const result = countIrv({
		ballots: [
			ballot(['ALP'], 10),
			ballot(['LNP'], 10),
			ballot(['AFP', 'ALP'], 5),
			ballot(['ONP', 'LNP'], 5),
			ballot(['GRN', 'LNP'], 5)
		],
		parties: PARTIES
	});
	// AFP, GRN and ON are tied at 5 votes and at 5 first preferences, so the party that is
	// latest in config order (AFP, index 5) is eliminated first.
	assert.equal(result.rounds[0].eliminated, 'AFP');
	assert.ok(result.winner);
}

// 5. Deterministic: ballot order must not matter.
{
	const ballots = [
		ballot(['ALP', 'GRN', 'LNP'], 7),
		ballot(['LNP', 'AFP', 'ALP'], 6),
		ballot(['AFP', 'LNP', 'ALP'], 5),
		ballot(['GRN', 'ALP', 'LNP'], 4),
		ballot(['ONP', 'LNP', 'ALP'], 3)
	];
	const forward = countIrv({ ballots, parties: PARTIES });
	const backward = countIrv({ ballots: [...ballots].reverse(), parties: PARTIES });
	assert.deepEqual(forward, backward);
}

// 6. Ranking key helpers and grouping by riding.
{
	const key = toRankingKey(PARTIES);
	assert.deepEqual(parseRankingKey(key), PARTIES);
	const grouped = countIrvByRiding(
		[
			{ ridingId: 'A', rankingKey: toRankingKey(ballot(['ALP']).ranking), votes: 3 },
			{ ridingId: 'B', rankingKey: toRankingKey(ballot(['LNP']).ranking), votes: 2 },
			{ ridingId: 'B', rankingKey: toRankingKey(ballot(['LNP']).ranking), votes: 0 }
		],
		PARTIES
	);
	assert.equal(grouped.get('A').winner, 'ALP');
	assert.equal(grouped.get('B').winner, 'LNP');
	assert.equal(grouped.get('B').totalBallots, 2);
}

// 7. Ranking validation.
{
	assert.equal(isCompleteRanking([...PARTIES], PARTIES), true);
	assert.equal(isCompleteRanking([...PARTIES].reverse(), PARTIES), true);
	assert.equal(isCompleteRanking(PARTIES.slice(1), PARTIES), false);
	assert.equal(isCompleteRanking([...PARTIES.slice(1), 'ALP', 'ALP'], PARTIES), false);
	assert.equal(isCompleteRanking([...PARTIES.slice(1), 'XXX'], PARTIES), false);
	assert.equal(isCompleteRanking('ALP>LNP', PARTIES), false);
}

console.log('IRV verification passed.');
