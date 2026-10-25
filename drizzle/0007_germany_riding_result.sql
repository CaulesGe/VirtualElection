CREATE TABLE "RidingResults"."germany_riding_result" (
	"riding_id" text NOT NULL,
	"party" text NOT NULL,
	"district" text NOT NULL,
	"year" integer NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "germany_riding_result_pk" PRIMARY KEY("riding_id","party","district","year")
);
--> statement-breakpoint
CREATE INDEX "germany_riding_result_scope_idx"
	ON "RidingResults"."germany_riding_result" USING btree ("district","year");
