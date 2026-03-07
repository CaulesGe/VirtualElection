import {
	integer,
	index,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
	id: serial('id').primaryKey(),
	code: text('code').notNull()
});

export const jurisdictions = pgTable('jurisdictions', {
	id: serial('id').primaryKey(),
	countryId: integer('country_id').notNull(),
	code: text('code').notNull()
});

export const constituencies = pgTable('constituencies', {
	id: serial('id').primaryKey(),
	jurisdictionId: integer('jurisdiction_id').notNull(),
	code: text('code').notNull(),
	name: text('name'),
	subnational: text('subnational')
});

export const elections = pgTable(
	'elections',
	{
		id: serial('id').primaryKey(),
		scopeCountry: text('scope_country').notNull(),
		scopeDistrict: text('scope_district').notNull(),
		scopeYear: integer('scope_year').notNull(),
		countryCode: text('country_code').notNull(),
		mapVersion: text('map_version').notNull(),
		status: text('status').notNull().default('active')
	},
	(table) => [
		uniqueIndex('elections_scope_unique').on(table.scopeCountry, table.scopeDistrict, table.scopeYear),
		index('elections_status_idx').on(table.status)
	]
);

export const parties = pgTable('parties', {
	id: text('id').primaryKey(),
	name: text('name').notNull()
});

export const electionParties = pgTable(
	'election_parties',
	{
		electionId: integer('election_id').notNull(),
		partyId: text('party_id').notNull()
	},
	(table) => [
		primaryKey({
			name: 'election_parties_pk',
			columns: [table.electionId, table.partyId]
		}),
		index('election_parties_election_idx').on(table.electionId)
	]
);

export const electionDistricts = pgTable(
	'election_districts',
	{
		id: serial('id').primaryKey(),
		electionId: integer('election_id').notNull(),
		districtKey: text('district_key').notNull(),
		name: text('name').notNull(),
		subnationalCode: text('subnational_code'),
		fips: text('fips'),
		electoralVotes: integer('electoral_votes'),
		sortOrder: integer('sort_order').notNull().default(0)
	},
	(table) => [
		uniqueIndex('election_districts_election_key_unique').on(table.electionId, table.districtKey),
		index('election_districts_election_idx').on(table.electionId),
		index('election_districts_subnational_idx').on(table.subnationalCode)
	]
);

export const virtualElectionVotes = pgTable(
	'virtual_election_votes',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id').notNull(),
		ipHash: text('ip_hash'),
		ridingId: text('riding_id').notNull(),
		party: text('party').notNull(),
		country: text('country').notNull(),
		district: text('district').notNull(),
		year: integer('year').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => [
		uniqueIndex('virtual_election_votes_user_scope_unique').on(
			table.userId,
			table.country,
			table.district,
			table.year
		),
		index('virtual_election_votes_scope_idx').on(table.country, table.district, table.year)
	]
);

export const canadaRidingResult = pgTable(
	'canada_riding_result',
	{
		ridingId: text('riding_id').notNull(),
		party: text('party').notNull(),
		district: text('district').notNull(),
		year: integer('year').notNull(),
		votes: integer('votes').notNull().default(0),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => [
		primaryKey({
			name: 'canada_riding_result_pk',
			columns: [table.ridingId, table.party, table.district, table.year]
		}),
		index('canada_riding_result_scope_idx').on(table.district, table.year)
	]
);

export const usaRidingResult = pgTable(
	'usa_riding_result',
	{
		ridingId: text('riding_id').notNull(),
		party: text('party').notNull(),
		district: text('district').notNull(),
		year: integer('year').notNull(),
		votes: integer('votes').notNull().default(0),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => [
		primaryKey({
			name: 'usa_riding_result_pk',
			columns: [table.ridingId, table.party, table.district, table.year]
		}),
		index('usa_riding_result_scope_idx').on(table.district, table.year)
	]
);
