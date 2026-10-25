CREATE TABLE IF NOT EXISTS "RidingResults"."riding_result" (
	"country" text NOT NULL,
	"riding_id" text NOT NULL,
	"party" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "riding_result_pk" PRIMARY KEY("country","riding_id","party","district","year")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "riding_result_scope_idx"
	ON "RidingResults"."riding_result" USING btree ("country","district","year");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RidingResults"."ballot_result" (
	"country" text NOT NULL,
	"riding_id" text NOT NULL,
	"ranking_key" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ballot_result_pk" PRIMARY KEY("country","riding_id","ranking_key","district","year")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ballot_result_scope_idx"
	ON "RidingResults"."ballot_result" USING btree ("country","district","year");
--> statement-breakpoint
-- Copy the existing per-country counters. The legacy tables are left in place (unused).
INSERT INTO "RidingResults"."riding_result" ("country", "riding_id", "party", "district", "year", "votes", "updated_at")
SELECT 'ca', "riding_id", "party", "district", "year", "votes", "updated_at" FROM "RidingResults"."canada_riding_result"
UNION ALL
SELECT 'us', "riding_id", "party", "district", "year", "votes", "updated_at" FROM "RidingResults"."usa_riding_result"
UNION ALL
SELECT 'uk', "riding_id", "party", "district", "year", "votes", "updated_at" FROM "RidingResults"."uk_riding_result"
UNION ALL
SELECT 'au', "riding_id", "party", "district", "year", "votes", "updated_at" FROM "RidingResults"."australia_riding_result"
UNION ALL
SELECT 'de', "riding_id", "party", "district", "year", "votes", "updated_at" FROM "RidingResults"."germany_riding_result"
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "RidingResults"."ballot_result" ("country", "riding_id", "ranking_key", "district", "year", "votes", "updated_at")
SELECT 'au', "riding_id", "ranking_key", "district", "year", "votes", "updated_at" FROM "RidingResults"."australia_ballot_result"
ON CONFLICT DO NOTHING;
