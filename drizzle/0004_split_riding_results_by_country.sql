CREATE SCHEMA IF NOT EXISTS "RidingResults";
--> statement-breakpoint
CREATE TABLE "RidingResults"."canada_riding_result" (
	"riding_id" text NOT NULL,
	"party" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "canada_riding_result_pk" PRIMARY KEY("riding_id","party","district","year")
);
--> statement-breakpoint
CREATE INDEX "canada_riding_result_scope_idx"
	ON "RidingResults"."canada_riding_result" USING btree ("district","year");
--> statement-breakpoint
CREATE TABLE "RidingResults"."usa_riding_result" (
	"riding_id" text NOT NULL,
	"party" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usa_riding_result_pk" PRIMARY KEY("riding_id","party","district","year")
);
--> statement-breakpoint
CREATE INDEX "usa_riding_result_scope_idx"
	ON "RidingResults"."usa_riding_result" USING btree ("district","year");
--> statement-breakpoint
INSERT INTO "RidingResults"."canada_riding_result" ("riding_id", "party", "district", "year", "votes", "updated_at")
SELECT "riding_id", "party", "district", "year", "votes", "updated_at"
FROM "virtual_election_riding_totals"
WHERE lower("country") = 'ca';
--> statement-breakpoint
INSERT INTO "RidingResults"."usa_riding_result" ("riding_id", "party", "district", "year", "votes", "updated_at")
SELECT "riding_id", "party", "district", "year", "votes", "updated_at"
FROM "virtual_election_riding_totals"
WHERE lower("country") = 'us';
--> statement-breakpoint
DROP TABLE "virtual_election_riding_totals";
