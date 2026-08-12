CREATE TABLE "team_commission_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receiver_user_id" uuid NOT NULL,
	"source_user_id" uuid NOT NULL,
	"claim_id" uuid NOT NULL,
	"level" integer NOT NULL,
	"source_dpy_amount" numeric(20, 8) NOT NULL,
	"commission_amount" numeric(20, 8) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_commission_level_range" CHECK ("team_commission_history"."level" >= 1 AND "team_commission_history"."level" <= 4),
	CONSTRAINT "team_commission_source_dpy_positive" CHECK ("team_commission_history"."source_dpy_amount" > 0),
	CONSTRAINT "team_commission_amount_positive" CHECK ("team_commission_history"."commission_amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "team_commission_history" ADD CONSTRAINT "team_commission_history_receiver_user_id_users_id_fk" FOREIGN KEY ("receiver_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_commission_history" ADD CONSTRAINT "team_commission_history_source_user_id_users_id_fk" FOREIGN KEY ("source_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_commission_history" ADD CONSTRAINT "team_commission_history_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "team_commission_history_receiver_idx" ON "team_commission_history" USING btree ("receiver_user_id");--> statement-breakpoint
CREATE INDEX "team_commission_history_source_idx" ON "team_commission_history" USING btree ("source_user_id");--> statement-breakpoint
CREATE INDEX "team_commission_history_created_idx" ON "team_commission_history" USING btree ("created_at");