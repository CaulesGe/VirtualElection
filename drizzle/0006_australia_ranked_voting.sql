ALTER TABLE "virtual_election_votes" ADD COLUMN "ranking_key" text;
--> statement-breakpoint
CREATE TABLE "RidingResults"."australia_riding_result" (
	"riding_id" text NOT NULL,
	"party" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "australia_riding_result_pk" PRIMARY KEY("riding_id","party","district","year")
);
--> statement-breakpoint
CREATE INDEX "australia_riding_result_scope_idx"
	ON "RidingResults"."australia_riding_result" USING btree ("district","year");
--> statement-breakpoint
CREATE TABLE "RidingResults"."australia_ballot_result" (
	"riding_id" text NOT NULL,
	"ranking_key" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "australia_ballot_result_pk" PRIMARY KEY("riding_id","ranking_key","district","year")
);
--> statement-breakpoint
CREATE INDEX "australia_ballot_result_scope_idx"
	ON "RidingResults"."australia_ballot_result" USING btree ("district","year");
