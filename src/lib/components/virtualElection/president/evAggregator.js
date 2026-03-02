const DEFAULT_PARTIES = ['DEM', 'REP', 'IND'];

function toNumber(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function resolveStateWinner(row) {
	const totals = row?.totals ?? {};
	const entries = Object.entries(totals).map(([party, votes]) => [party, toNumber(votes)]);
	if (entries.length === 0) return { winner: null, isTie: false };

	let maxVotes = -1;
	let topParties = [];
	for (const [party, votes] of entries) {
		if (votes > maxVotes) {
			maxVotes = votes;
			topParties = [party];
		} else if (votes === maxVotes) {
			topParties.push(party);
		}
	}
	if (maxVotes <= 0) return { winner: null, isTie: false };
	if (topParties.length > 1) return { winner: null, isTie: true };
	return { winner: topParties[0], isTie: false };
}

export function aggregateEvByStateWinners({ districtRows = [], virtualTotals = [] }) {
	const totalsById = new Map(virtualTotals.map((row) => [String(row.ridingId), row]));
	const evByParty = {};
	const popularVotesByParty = {};
	let uncalledEv = 0;
	let totalEv = 0;

	for (const row of virtualTotals) {
		for (const [party, votes] of Object.entries(row?.totals ?? {})) {
			popularVotesByParty[party] = (popularVotesByParty[party] ?? 0) + toNumber(votes);
		}
	}
	const totalPopularVotes = Object.values(popularVotesByParty).reduce((sum, value) => sum + value, 0);
	const popularVotePctByParty = Object.fromEntries(
		Object.entries(popularVotesByParty).map(([party, votes]) => [
			party,
			totalPopularVotes > 0 ? (votes / totalPopularVotes) * 100 : 0
		])
	);

	for (const district of districtRows) {
		const districtKey = String(district?.code ?? district?.districtKey ?? '');
		const districtEv = toNumber(district?.electoralVotes);
		if (!districtKey || districtEv <= 0) continue;
		totalEv += districtEv;

		const row = totalsById.get(districtKey);
		const { winner, isTie } = resolveStateWinner(row);
		if (!winner || isTie) {
			uncalledEv += districtEv;
			continue;
		}
		evByParty[winner] = (evByParty[winner] ?? 0) + districtEv;
	}

	for (const party of DEFAULT_PARTIES) {
		evByParty[party] = evByParty[party] ?? 0;
	}

	const threshold = Math.floor(totalEv / 2) + 1;
	const needsByParty = Object.fromEntries(
		Object.entries(evByParty).map(([party, ev]) => [party, Math.max(0, threshold - ev)])
	);

	return {
		evByParty,
		uncalledEv,
		totalEv,
		threshold,
		needsByParty,
		popularVotesByParty,
		popularVotePctByParty,
		totalPopularVotes
	};
}
