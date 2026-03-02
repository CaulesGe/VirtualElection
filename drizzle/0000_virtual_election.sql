CREATE TABLE "virtual_election_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"riding_id" text NOT NULL,
	"party" text NOT NULL,
	"country" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "virtual_election_votes_user_scope_unique"
	ON "virtual_election_votes" USING btree ("user_id","country","district","year");
--> statement-breakpoint
CREATE INDEX "virtual_election_votes_scope_idx"
	ON "virtual_election_votes" USING btree ("country","district","year");
--> statement-breakpoint
CREATE TABLE "virtual_election_riding_totals" (
	"riding_id" text NOT NULL,
	"party" text NOT NULL,
	"country" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "virtual_election_riding_totals_pk" PRIMARY KEY("riding_id","party","country","district","year")
);
--> statement-breakpoint
CREATE INDEX "virtual_election_riding_totals_scope_idx"
	ON "virtual_election_riding_totals" USING btree ("country","district","year");
