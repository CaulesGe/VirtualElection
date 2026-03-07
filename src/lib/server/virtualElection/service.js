import { and, desc, eq, sql } from 'drizzle-orm';
import {
	DEFAULT_SCOPE,
	VIRTUAL_ELECTION_ALLOWED_SCOPES,
	getAllowedPartiesForScope as getAllowedPartiesForScopeConfig
} from '@/lib/config/virtualElection';
import { db } from '@/lib/server/db/client';
import { getMapMetadataForScope } from '@/lib/server/virtualElection/mapMetadata';
import { getRidingsForScope } from '@/lib/server/virtualElection/ridings';
import {
	canadaRidingResult,
	electionParties,
	elections,
	parties,
	usaRidingResult,
	virtualElectionVotes
} from '@/lib/server/db/schema';

export class VirtualElectionError extends Error {
	constructor(code, message) {
		super(message);
		this.code = code;
	}
}

export function isMissingVirtualElectionTableError(error) {
	const visited = new Set();
	const queue = [error];

	while (queue.length > 0) {
		const current = queue.shift();
		if (!current || visited.has(current)) continue;
		visited.add(current);
		const obj = current;

		if (obj?.code === '42P01') return true;
		const message = (obj?.message ?? '').toLowerCase();
		if (
			(message.includes('relation') && message.includes('does not exist')) ||
			message.includes('canada_riding_result') ||
			message.includes('usa_riding_result') ||
			message.includes('virtual_election_riding_totals') ||
			message.includes('virtual_election_votes')
		) {
			return true;
		}
		if (obj?.cause) queue.push(obj.cause);
		if (obj?.originalError) queue.push(obj.originalError);
	}
	return false;
}

function getDeadlineDate() {
	const raw = process.env.VIRTUAL_ELECTION_DEADLINE_ISO;
	if (!raw) return null;
	const parsed = new Date(raw);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function assertVoteWindowOpen() {
	const deadline = getDeadlineDate();
	if (deadline && new Date() > deadline) {
		throw new VirtualElectionError('VOTE_LOCKED', 'Voting is closed.');
	}
}

const RIDING_RESULT_TABLES = {
	ca: {
		name: 'canada_riding_result',
		table: canadaRidingResult
	},
	us: {
		name: 'usa_riding_result',
		table: usaRidingResult
	}
};

export function normalizeScope(scope) {
	return {
		country: String(scope.country ?? DEFAULT_SCOPE.country).toLowerCase(),
		district: String(scope.district ?? DEFAULT_SCOPE.district).toLowerCase(),
		year: Number(scope.year ?? DEFAULT_SCOPE.year)
	};
}

function getRidingResultTableConfig(scopeInput) {
	const scope = normalizeScope(scopeInput);
	const config = RIDING_RESULT_TABLES[scope.country];
	if (!config) {
		throw new VirtualElectionError('INVALID_SCOPE', 'Unsupported result table scope.');
	}
	return config;
}

export function assertAllowedScope(scopeInput) {
	const scope = normalizeScope(scopeInput);
	const allowed = VIRTUAL_ELECTION_ALLOWED_SCOPES.some(
		(candidate) =>
			candidate.country === scope.country &&
			candidate.district === scope.district &&
			candidate.year === scope.year
	);
	if (!allowed) throw new VirtualElectionError('INVALID_SCOPE', 'Invalid virtual election scope.');
	return scope;
}

async function readAllowedPartiesFromDb(scope) {
	const electionRows = await db
		.select({ id: elections.id })
		.from(elections)
		.where(
			and(
				eq(elections.scopeCountry, scope.country),
				eq(elections.scopeDistrict, scope.district),
				eq(elections.scopeYear, scope.year),
				eq(elections.status, 'active')
			)
		)
		.limit(1);

	const election = electionRows[0];
	if (!election) return null;

	const rows = await db
		.select({ partyId: electionParties.partyId })
		.from(electionParties)
		.innerJoin(parties, eq(parties.id, electionParties.partyId))
		.where(eq(electionParties.electionId, election.id));

	const allowedParties = rows.map((row) => row.partyId);
	return allowedParties.length > 0 ? allowedParties : null;
}

export async function getAllowedPartiesForScope(scopeInput) {
	const scope = normalizeScope(scopeInput);
	try {
		const fromDb = await readAllowedPartiesFromDb(scope);
		if (fromDb?.length) return fromDb;
	} catch (error) {
		console.error('[virtual-election] Failed loading allowed parties from DB, falling back to config', {
			scope,
			reason: error?.message ?? 'unknown'
		});
	}
	return getAllowedPartiesForScopeConfig(scope);
}

export async function assertValidParty(party, scope) {
	const allowedParties = await getAllowedPartiesForScope(scope);
	if (!allowedParties.includes(party)) {
		throw new VirtualElectionError('INVALID_PARTY', 'Invalid party selection.');
	}
}

export function assertValidRidingId(ridingId) {
	if (!ridingId || !ridingId.trim()) {
		throw new VirtualElectionError('INVALID_RIDING', 'Invalid riding ID.');
	}
}

async function assertValidRidingForScope(ridingId, scope) {
	try {
		const ridings = await getRidingsForScope(scope);
		const exists = ridings.some((riding) => String(riding.code) === String(ridingId));
		if (exists) return;
		throw new VirtualElectionError('INVALID_RIDING', 'Invalid riding ID.');
	} catch (error) {
		if (error instanceof VirtualElectionError) throw error;
		console.error('[INTEGRITY_EVENT] Scope/riding validation unavailable', {
			scope,
			ridingId,
			reason: error?.message ?? 'unknown'
		});
		throw new VirtualElectionError(
			'SCOPE_VALIDATION_UNAVAILABLE',
			'Riding validation unavailable. Vote rejected for integrity.'
		);
	}
}

export async function castOrUpdateVote(input) {
	assertVoteWindowOpen();
	assertValidRidingId(input.ridingId);

	const scope = assertAllowedScope(input);
	const ridingResultTable = getRidingResultTableConfig(scope);
	const ridingResultTableSql = sql.raw(`"${ridingResultTable.name}"`);
	const ridingResultVotesSql = sql.raw(`"${ridingResultTable.name}".votes`);
	await assertValidParty(input.party, scope);
	await assertValidRidingForScope(input.ridingId, scope);

	try {
		const execution = await db.execute(sql`
			WITH previous_vote AS (
				SELECT riding_id, party
				FROM virtual_election_votes
				WHERE user_id = ${input.userId}
				  AND country = ${scope.country}
				  AND district = ${scope.district}
				  AND year = ${scope.year}
				LIMIT 1
			),
			upsert_vote AS (
				INSERT INTO virtual_election_votes (user_id, ip_hash, riding_id, party, country, district, year)
				VALUES (${input.userId}, ${input.ipHash ?? null}, ${input.ridingId}, ${input.party}, ${scope.country}, ${scope.district}, ${scope.year})
				ON CONFLICT (user_id, country, district, year)
				DO UPDATE SET
					ip_hash = EXCLUDED.ip_hash,
					riding_id = EXCLUDED.riding_id,
					party = EXCLUDED.party,
					updated_at = now()
				RETURNING riding_id AS new_riding_id, party AS new_party
			),
			change_flags AS (
				SELECT
					pv.riding_id AS prev_riding_id,
					pv.party AS prev_party,
					uv.new_riding_id,
					uv.new_party,
					(pv.riding_id IS NULL) AS is_created,
					(
						pv.riding_id IS NOT NULL
						AND pv.riding_id = uv.new_riding_id
						AND pv.party = uv.new_party
					) AS is_unchanged
				FROM upsert_vote uv
				LEFT JOIN previous_vote pv ON true
			),
			decrement_totals AS (
				UPDATE ${ridingResultTableSql} t
				SET votes = GREATEST(t.votes - 1, 0),
					updated_at = now()
				FROM change_flags cf
				WHERE NOT cf.is_created
				  AND NOT cf.is_unchanged
				  AND t.riding_id = cf.prev_riding_id
				  AND t.party = cf.prev_party
				  AND t.district = ${scope.district}
				  AND t.year = ${scope.year}
			),
			increment_totals AS (
				INSERT INTO ${ridingResultTableSql} (riding_id, party, district, year, votes)
				SELECT cf.new_riding_id, cf.new_party, ${scope.district}, ${scope.year}, 1
				FROM change_flags cf
				WHERE cf.is_created OR NOT cf.is_unchanged
				ON CONFLICT (riding_id, party, district, year)
				DO UPDATE SET
					votes = ${ridingResultVotesSql} + 1,
					updated_at = now()
			)
			SELECT
				new_riding_id,
				new_party,
				is_created,
				is_unchanged
			FROM change_flags
			LIMIT 1
		`);

		const row = execution?.rows?.[0];
		if (!row) throw new VirtualElectionError('CONFLICT', 'Vote conflict. Please retry.');

		const status = row.is_created ? 'created' : row.is_unchanged ? 'unchanged' : 'updated';
		return {
			status,
			voted: true,
			ridingId: String(row.new_riding_id ?? input.ridingId),
			party: String(row.new_party ?? input.party)
		};
	} catch (error) {
		const dbCode = error?.code;
		if (dbCode === '23505') {
			throw new VirtualElectionError('CONFLICT', 'Vote conflict. Please retry.');
		}
		throw error;
	}
}

export async function getElectionOptionsForScope(scopeInput) {
	const scope = assertAllowedScope(scopeInput);
	const scopeId = `${scope.country}:${scope.district}:${scope.year}`;
	const mapMeta = getMapMetadataForScope(scope);
	const fallback = {
		scopeId,
		scope,
		countryCode: mapMeta.countryCode,
		mapVersion: mapMeta.mapVersion,
		mode: mapMeta.mode,
		regionKey: mapMeta.regionKey,
		allocationRule: mapMeta.allocationRule,
		electoralVotesVersion: mapMeta.electoralVotesVersion,
		districtIdNamespace: `${scope.country}:${scope.district}:riding-id`,
		allowedParties: getAllowedPartiesForScopeConfig(scope)
	};

	try {
		const rows = await db
			.select({
				countryCode: elections.countryCode,
				mapVersion: elections.mapVersion
			})
			.from(elections)
			.where(
				and(
					eq(elections.scopeCountry, scope.country),
					eq(elections.scopeDistrict, scope.district),
					eq(elections.scopeYear, scope.year),
					eq(elections.status, 'active')
				)
			)
			.limit(1);

		const election = rows[0];
		if (!election) {
			return {
				...fallback,
				allowedParties: await getAllowedPartiesForScope(scope)
			};
		}

		return {
			...fallback,
			countryCode: election.countryCode,
			mapVersion: election.mapVersion,
			allowedParties: await getAllowedPartiesForScope(scope)
		};
	} catch (error) {
		console.error('[virtual-election] Failed loading election options from DB, using config fallback', {
			scope,
			reason: error?.message ?? 'unknown'
		});
		return {
			...fallback,
			allowedParties: await getAllowedPartiesForScope(scope)
		};
	}
}

export async function getTotals(scopeInput) {
	const scope = normalizeScope(scopeInput);
	const ridingResultTable = getRidingResultTableConfig(scope).table;
	const rows = await db
		.select({
			ridingId: ridingResultTable.ridingId,
			party: ridingResultTable.party,
			votes: ridingResultTable.votes
		})
		.from(ridingResultTable)
		.where(
			and(
				eq(ridingResultTable.district, scope.district),
				eq(ridingResultTable.year, scope.year)
			)
		);

	const ridingMap = new Map();
	for (const row of rows) {
		const key = String(row.ridingId);
		const entry = ridingMap.get(key) ?? { totals: {}, totalVotes: 0 };
		entry.totals[row.party] = row.votes;
		entry.totalVotes += row.votes;
		ridingMap.set(key, entry);
	}

	return Array.from(ridingMap.entries()).map(([ridingId, entry]) => {
		let leader = null;
		let leaderVotes = 0;
		for (const [party, votes] of Object.entries(entry.totals)) {
			if (votes > leaderVotes) {
				leaderVotes = votes;
				leader = party;
			}
		}
		return {
			ridingId,
			totals: entry.totals,
			leader,
			intensity: entry.totalVotes > 0 ? leaderVotes / entry.totalVotes : 0,
			totalVotes: entry.totalVotes
		};
	});
}

export async function getUserVote(userId, scopeInput) {
	const scope = normalizeScope(scopeInput);
	const rows = await db
		.select({
			ridingId: virtualElectionVotes.ridingId,
			party: virtualElectionVotes.party
		})
		.from(virtualElectionVotes)
		.where(
			and(
				eq(virtualElectionVotes.userId, userId),
				eq(virtualElectionVotes.country, scope.country),
				eq(virtualElectionVotes.district, scope.district),
				eq(virtualElectionVotes.year, scope.year)
			)
		)
		.limit(1);

	const vote = rows[0];
	if (!vote) return { voted: false };
	return { voted: true, ridingId: vote.ridingId, party: vote.party };
}

export async function listVotesForUser(userId) {
	if (!userId) return [];

	const rows = await db
		.select({
			scopeCountry: virtualElectionVotes.country,
			scopeDistrict: virtualElectionVotes.district,
			scopeYear: virtualElectionVotes.year,
			districtId: virtualElectionVotes.ridingId,
			partyId: virtualElectionVotes.party,
			updatedAt: virtualElectionVotes.updatedAt
		})
		.from(virtualElectionVotes)
		.where(eq(virtualElectionVotes.userId, userId))
		.orderBy(desc(virtualElectionVotes.updatedAt));

	return rows.map((row) => ({
		scopeCountry: String(row.scopeCountry ?? '').toLowerCase(),
		scopeDistrict: String(row.scopeDistrict ?? '').toLowerCase(),
		scopeYear: Number(row.scopeYear ?? 0),
		districtId: String(row.districtId ?? ''),
		partyId: String(row.partyId ?? ''),
		updatedAt: row.updatedAt ?? null
	}));
}
