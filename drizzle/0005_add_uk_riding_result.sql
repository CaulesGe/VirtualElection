CREATE TABLE "RidingResults"."uk_riding_result" (
	"riding_id" text NOT NULL,
	"party" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uk_riding_result_pk" PRIMARY KEY("riding_id","party","district","year")
);
--> statement-breakpoint
CREATE INDEX "uk_riding_result_scope_idx"
	ON "RidingResults"."uk_riding_result" USING btree ("district","year");
--> statement-breakpoint
INSERT INTO "RidingResults"."uk_riding_result" ("riding_id", "party", "district", "year", "votes", "updated_at")
SELECT
	"riding_id",
	"party",
	"district",
	"year",
	COUNT(*)::int AS votes,
	now() AS updated_at
FROM "virtual_election_votes"
WHERE lower("country") = 'uk'
GROUP BY "riding_id", "party", "district", "year";
