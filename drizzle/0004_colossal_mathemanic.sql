CREATE TABLE "deposit_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"network" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sender_id" uuid,
	"sender_type" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vip_status" ALTER COLUMN "tier" SET DEFAULT 'VIP1';--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "principal_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "trial_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "referral_income" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "daily_yield" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "team_income" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "incentive_income" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "tx_hash" text;--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "network" text NOT NULL;--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "deposit_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD COLUMN "fee" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD COLUMN "net_amount" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD COLUMN "tx_hash" text;--> statement-breakpoint
ALTER TABLE "vip_status" ADD COLUMN "level_a_valid_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vip_status" ADD COLUMN "level_bcd_valid_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vip_status" ADD COLUMN "team_total_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "referral_income_history" ADD COLUMN "deposit_id" uuid;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "total_assets" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "vip_tier" text DEFAULT 'VIP1' NOT NULL;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "vip_rate" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "salary_history" ADD COLUMN "star_title" text;--> statement-breakpoint
ALTER TABLE "salary_history" ADD COLUMN "qualified_vip2_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD CONSTRAINT "deposit_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "deposit_addresses_user_network_idx" ON "deposit_addresses" USING btree ("user_id","network");--> statement-breakpoint
CREATE UNIQUE INDEX "deposit_addresses_address_idx" ON "deposit_addresses" USING btree ("address");--> statement-breakpoint
CREATE INDEX "deposit_addresses_user_idx" ON "deposit_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_messages_ticket_idx" ON "support_messages" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "support_messages_sender_idx" ON "support_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "support_messages_created_idx" ON "support_messages" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_parent_referral_id_users_id_fk" FOREIGN KEY ("parent_referral_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_income_history" ADD CONSTRAINT "referral_income_history_deposit_id_deposits_id_fk" FOREIGN KEY ("deposit_id") REFERENCES "public"."deposits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deposits_tx_hash_idx" ON "deposits" USING btree ("tx_hash");--> statement-breakpoint
CREATE INDEX "withdrawals_tx_hash_idx" ON "withdrawals" USING btree ("tx_hash");--> statement-breakpoint
CREATE INDEX "transactions_wallet_id_idx" ON "transactions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "deposits" DROP COLUMN "admin_approval_status";--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_tx_hash_unique" UNIQUE("tx_hash");--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "principal_balance_non_negative" CHECK ("wallets"."principal_balance" >= 0);--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "trial_balance_non_negative" CHECK ("wallets"."trial_balance" >= 0);--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "referral_income_non_negative" CHECK ("wallets"."referral_income" >= 0);--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "daily_yield_non_negative" CHECK ("wallets"."daily_yield" >= 0);--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "team_income_non_negative" CHECK ("wallets"."team_income" >= 0);--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "incentive_income_non_negative" CHECK ("wallets"."incentive_income" >= 0);--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawal_fee_non_negative" CHECK ("withdrawals"."fee" >= 0);--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawal_net_amount_non_negative" CHECK ("withdrawals"."net_amount" >= 0);--> statement-breakpoint
ALTER TABLE "vip_status" ADD CONSTRAINT "level_a_valid_count_non_negative" CHECK ("vip_status"."level_a_valid_count" >= 0);--> statement-breakpoint
ALTER TABLE "vip_status" ADD CONSTRAINT "level_bcd_valid_count_non_negative" CHECK ("vip_status"."level_bcd_valid_count" >= 0);--> statement-breakpoint
ALTER TABLE "vip_status" ADD CONSTRAINT "team_total_count_non_negative" CHECK ("vip_status"."team_total_count" >= 0);--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claim_total_assets_non_negative" CHECK ("claims"."total_assets" >= 0);--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claim_vip_rate_non_negative" CHECK ("claims"."vip_rate" >= 0);--> statement-breakpoint
ALTER TABLE "salary_history" ADD CONSTRAINT "salary_qualified_vip2_count_non_negative" CHECK ("salary_history"."qualified_vip2_count" >= 0);