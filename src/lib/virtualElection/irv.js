/**
 * Instant-runoff (preferential) counting for ranked ballots.
 *
 * Pure functions with no framework or DB dependencies so they can be reused by
 * API routes and verification scripts.
 */

export const RANKING_SEPARATOR = '>';

export function toRankingKey(ranking) {
	return (ranking ?? []).map((party) => String(party)).join(RANKING_SEPARATOR);
}

export function parseRankingKey(key) {
	const raw = String(key ?? '').trim();
	if (!raw) return [];
	return raw.split(RANKING_SEPARATOR).filter(Boolean);
}

/**
 * Count one division.
 *
 * @param {object} input
 * @param {Array<{ranking: string[], votes: number}>} input.ballots Aggregated ballots.
 * @param {string[]} input.parties Candidate parties. The order is the last-resort tie-break
 *   order: when parties are still tied after comparing first preferences, the party that
 *   appears LATER in this list is eliminated first.
 * @returns {{
 *   totalBallots: number,
 *   rounds: Array<{round: number, counts: Record<string, number>, total: number, eliminated: string | null}>,
 *   winner: string | null,
 *   firstPreferenceLeader: string | null,
 *   finalTwo: Array<{party: string, votes: number}>,
 *   winnerShare: number,
 *   exhausted: number
 * }}
 */
export function countIrv({ ballots, parties }) {
	const order = new Map(parties.map((party, index) => [party, index]));
	const usable = [];
	let totalBallots = 0;
	for (const ballot of ballots ?? []) {
		const votes = Number(ballot?.votes ?? 0);
		if (!Number.isFinite(votes) || votes <= 0) continue;
		const ranking = (ballot.ranking ?? []).filter((party) => order.has(party));
		totalBallots += votes;
		usable.push({ ranking, votes });
	}

	const empty = {
		totalBallots,
		rounds: [],
		winner: null,
		firstPreferenceLeader: null,
		finalTwo: [],
		winnerShare: 0,
		exhausted: 0
	};
	if (totalBallots === 0) return empty;

	// First preferences decide who is in the count. A party with no first preferences is the
	// strict minimum in round one, so it would be eliminated before any transfer happens.
	const firstPreferences = new Map(parties.map((party) => [party, 0]));
	for (const ballot of usable) {
		const first = ballot.ranking[0];
		if (first) firstPreferences.set(first, (firstPreferences.get(first) ?? 0) + ballot.votes);
	}

	const remaining = new Set(parties.filter((party) => (firstPreferences.get(party) ?? 0) > 0));
	if (remaining.size === 0) return empty;

	let firstPreferenceLeader = null;
	for (const party of parties) {
		const votes = firstPreferences.get(party) ?? 0;
		if (votes > 0 && (firstPreferenceLeader === null || votes > firstPreferences.get(firstPreferenceLeader))) {
			firstPreferenceLeader = party;
		}
	}

	const rounds = [];
	let winner = null;
	let lastCounts = null;
	let lastTotal = 0;
	let exhausted = 0;

	for (let round = 1; round <= parties.length + 1; round += 1) {
		const counts = new Map(Array.from(remaining, (party) => [party, 0]));
		exhausted = 0;
		for (const ballot of usable) {
			const target = ballot.ranking.find((party) => remaining.has(party));
			if (target) counts.set(target, counts.get(target) + ballot.votes);
			else exhausted += ballot.votes;
		}
		const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
		lastCounts = counts;
		lastTotal = total;

		const sorted = Array.from(counts.entries()).sort(
			(a, b) => b[1] - a[1] || order.get(a[0]) - order.get(b[0])
		);
		const [topParty, topVotes] = sorted[0];

		const record = (eliminated) => {
			rounds.push({
				round,
				counts: Object.fromEntries(counts),
				total,
				eliminated
			});
		};

		if (topVotes * 2 > total || remaining.size === 1) {
			winner = topParty;
			record(null);
			break;
		}

		const minVotes = sorted[sorted.length - 1][1];
		const tied = sorted.filter(([, votes]) => votes === minVotes).map(([party]) => party);
		tied.sort(
			(a, b) =>
				(firstPreferences.get(a) ?? 0) - (firstPreferences.get(b) ?? 0) ||
				order.get(b) - order.get(a)
		);
		const eliminated = tied[0];
		record(eliminated);
		remaining.delete(eliminated);
	}

	const finalSorted = Array.from(lastCounts.entries()).sort(
		(a, b) => b[1] - a[1] || order.get(a[0]) - order.get(b[0])
	);
	const finalTwo = finalSorted.slice(0, 2).map(([party, votes]) => ({ party, votes }));

	return {
		totalBallots,
		rounds,
		winner,
		firstPreferenceLeader,
		finalTwo,
		winnerShare: winner && lastTotal > 0 ? (lastCounts.get(winner) ?? 0) / lastTotal : 0,
		exhausted
	};
}

/**
 * Count many divisions from aggregated rows.
 *
 * @param {Array<{ridingId: string, rankingKey: string, votes: number}>} rows
 * @param {string[]} parties
 * @returns {Map<string, ReturnType<typeof countIrv>>}
 */
export function countIrvByRiding(rows, parties) {
	const grouped = new Map();
	for (const row of rows ?? []) {
		const ridingId = String(row?.ridingId ?? '');
		if (!ridingId) continue;
		const list = grouped.get(ridingId) ?? [];
		list.push({ ranking: parseRankingKey(row.rankingKey), votes: Number(row.votes ?? 0) });
		grouped.set(ridingId, list);
	}
	const results = new Map();
	for (const [ridingId, ballots] of grouped) {
		results.set(ridingId, countIrv({ ballots, parties }));
	}
	return results;
}

/**
 * A valid AU ballot ranks every allowed party exactly once.
 */
export function isCompleteRanking(ranking, allowedParties) {
	if (!Array.isArray(ranking)) return false;
	if (ranking.length !== allowedParties.length) return false;
	const seen = new Set();
	for (const party of ranking) {
		if (typeof party !== 'string' || !allowedParties.includes(party) || seen.has(party)) {
			return false;
		}
		seen.add(party);
	}
	return true;
}
