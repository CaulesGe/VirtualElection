CREATE TABLE "elections" (
	"id" serial PRIMARY KEY NOT NULL,
	"scope_country" text NOT NULL,
	"scope_district" text NOT NULL,
	"scope_year" integer NOT NULL,
	"country_code" text NOT NULL,
	"map_version" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "elections_scope_unique"
	ON "elections" USING btree ("scope_country","scope_district","scope_year");
--> statement-breakpoint
CREATE INDEX "elections_status_idx"
	ON "elections" USING btree ("status");
--> statement-breakpoint
CREATE TABLE "parties" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "election_parties" (
	"election_id" integer NOT NULL,
	"party_id" text NOT NULL,
	CONSTRAINT "election_parties_pk" PRIMARY KEY("election_id","party_id")
);
--> statement-breakpoint
CREATE INDEX "election_parties_election_idx"
	ON "election_parties" USING btree ("election_id");
