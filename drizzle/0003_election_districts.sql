CREATE TABLE "election_districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"election_id" integer NOT NULL,
	"district_key" text NOT NULL,
	"name" text NOT NULL,
	"subnational_code" text,
	"fips" text,
	"electoral_votes" integer,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "election_districts_election_key_unique"
	ON "election_districts" USING btree ("election_id","district_key");
--> statement-breakpoint
CREATE INDEX "election_districts_election_idx"
	ON "election_districts" USING btree ("election_id");
--> statement-breakpoint
CREATE INDEX "election_districts_subnational_idx"
	ON "election_districts" USING btree ("subnational_code");
