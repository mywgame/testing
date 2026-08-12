CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"user_id" text NOT NULL,
	"referral_code" text NOT NULL,
	"parent_referral_id" uuid,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"lock_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"available_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"locked_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"total_deposited" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"total_withdrawn" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"total_earned" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "available_balance_non_negative" CHECK ("wallets"."available_balance" >= 0),
	CONSTRAINT "locked_balance_non_negative" CHECK ("wallets"."locked_balance" >= 0),
	CONSTRAINT "total_deposited_non_negative" CHECK ("wallets"."total_deposited" >= 0),
	CONSTRAINT "total_withdrawn_non_negative" CHECK ("wallets"."total_withdrawn" >= 0),
	CONSTRAINT "total_earned_non_negative" CHECK ("wallets"."total_earned" >= 0)
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"reference_number" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"admin_approval_status" text DEFAULT 'PENDING' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deposits_reference_number_unique" UNIQUE("reference_number"),
	CONSTRAINT "deposit_amount_positive" CHECK ("deposits"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"wallet_address" text NOT NULL,
	"network" text NOT NULL,
	"reference" text NOT NULL,
	"admin_approval_status" text DEFAULT 'PENDING' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "withdrawals_reference_unique" UNIQUE("reference"),
	CONSTRAINT "withdrawal_amount_positive" CHECK ("withdrawals"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" text NOT NULL,
	"reference_id" text NOT NULL,
	"status" text DEFAULT 'COMPLETED' NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"balance_before" numeric(20, 8) NOT NULL,
	"balance_after" numeric(20, 8) NOT NULL,
	"created_by" text DEFAULT 'SYSTEM' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "balance_before_non_negative" CHECK ("transactions"."balance_before" >= 0),
	CONSTRAINT "balance_after_non_negative" CHECK ("transactions"."balance_after" >= 0)
);
--> statement-breakpoint
CREATE TABLE "vip_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"previous_tier" text NOT NULL,
	"new_tier" text NOT NULL,
	"reason" text NOT NULL,
	"updated_by" text DEFAULT 'SYSTEM' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vip_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" text DEFAULT 'VIP_0' NOT NULL,
	"points" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vip_status_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "referral_income_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_user_id" uuid NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"level" integer NOT NULL,
	"transaction_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_income_amount_positive" CHECK ("referral_income_history"."amount" > 0),
	CONSTRAINT "referral_income_level_positive" CHECK ("referral_income_history"."level" > 0)
);
--> statement-breakpoint
CREATE TABLE "referral_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	"referral_level" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_relationships_child_id_unique" UNIQUE("child_id"),
	CONSTRAINT "referral_level_positive" CHECK ("referral_relationships"."referral_level" > 0)
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"claim_date" timestamp NOT NULL,
	"claim_status" text DEFAULT 'PENDING' NOT NULL,
	"reward_amount" numeric(20, 8) NOT NULL,
	"claimed_at" timestamp,
	"expired" boolean DEFAULT false NOT NULL,
	"claim_window_open_time" timestamp NOT NULL,
	"claim_window_close_time" timestamp NOT NULL,
	"transaction_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "claim_reward_amount_non_negative" CHECK ("claims"."reward_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "income_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"description" text NOT NULL,
	"transaction_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "income_amount_positive" CHECK ("income_history"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "salary_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"pay_period_start" timestamp NOT NULL,
	"pay_period_end" timestamp NOT NULL,
	"status" text DEFAULT 'PAID' NOT NULL,
	"transaction_id" uuid NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "salary_amount_positive" CHECK ("salary_history"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_name" text NOT NULL,
	"star" integer DEFAULT 1 NOT NULL,
	"unlocked_date" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'UNLOCKED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "star_rating_non_negative" CHECK ("achievements"."star" >= 0)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"priority" text DEFAULT 'LOW' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ticket_number" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"priority" text DEFAULT 'LOW' NOT NULL,
	"assigned_admin_uid" text,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_uid" text NOT NULL,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"ip_address" text,
	"device" text,
	"old_value" text,
	"new_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event" text NOT NULL,
	"status" text DEFAULT 'SUCCESS' NOT NULL,
	"ip_address" text,
	"device" text,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_by" text DEFAULT 'SYSTEM' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"device" text,
	"browser" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vip_history" ADD CONSTRAINT "vip_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vip_status" ADD CONSTRAINT "vip_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_income_history" ADD CONSTRAINT "referral_income_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_income_history" ADD CONSTRAINT "referral_income_history_source_user_id_users_id_fk" FOREIGN KEY ("source_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_child_id_users_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_history" ADD CONSTRAINT "income_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_history" ADD CONSTRAINT "income_history_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_history" ADD CONSTRAINT "salary_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_history" ADD CONSTRAINT "salary_history_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_user_id_idx" ON "users" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_referral_code_idx" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_parent_referral_idx" ON "users" USING btree ("parent_referral_id");--> statement-breakpoint
CREATE INDEX "wallets_user_id_idx" ON "wallets" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "deposits_ref_idx" ON "deposits" USING btree ("reference_number");--> statement-breakpoint
CREATE INDEX "deposits_user_id_idx" ON "deposits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deposits_status_idx" ON "deposits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deposits_created_at_idx" ON "deposits" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "withdrawals_ref_idx" ON "withdrawals" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "withdrawals_user_id_idx" ON "withdrawals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "withdrawals_status_idx" ON "withdrawals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "withdrawals_created_at_idx" ON "withdrawals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transactions_ref_id_idx" ON "transactions" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vip_history_user_idx" ON "vip_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vip_history_created_idx" ON "vip_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vip_status_user_idx" ON "vip_status" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vip_status_tier_idx" ON "vip_status" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "referral_income_user_idx" ON "referral_income_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "referral_income_source_idx" ON "referral_income_history" USING btree ("source_user_id");--> statement-breakpoint
CREATE INDEX "referral_income_created_idx" ON "referral_income_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "referral_relationships_parent_idx" ON "referral_relationships" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "referral_relationships_child_idx" ON "referral_relationships" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "referral_relationships_level_idx" ON "referral_relationships" USING btree ("referral_level");--> statement-breakpoint
CREATE INDEX "claims_user_idx" ON "claims" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "claims_date_idx" ON "claims" USING btree ("claim_date");--> statement-breakpoint
CREATE INDEX "claims_status_idx" ON "claims" USING btree ("claim_status");--> statement-breakpoint
CREATE INDEX "income_history_user_idx" ON "income_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "income_history_type_idx" ON "income_history" USING btree ("type");--> statement-breakpoint
CREATE INDEX "income_history_created_idx" ON "income_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "salary_history_user_idx" ON "salary_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "salary_history_paid_idx" ON "salary_history" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "achievements_user_idx" ON "achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "achievements_name_idx" ON "achievements" USING btree ("achievement_name");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "notifications_created_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "support_tickets_num_idx" ON "support_tickets" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX "support_tickets_user_idx" ON "support_tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_tickets_status_idx" ON "support_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_uid");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_logs_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_event_idx" ON "activity_logs" USING btree ("event");--> statement-breakpoint
CREATE INDEX "activity_logs_created_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "system_settings_key_idx" ON "system_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "user_settings_user_idx" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_hash_idx" ON "sessions" USING btree ("token_hash");