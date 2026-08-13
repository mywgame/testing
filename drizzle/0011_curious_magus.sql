CREATE TABLE "admin_security" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"totp_enabled" boolean DEFAULT false NOT NULL,
	"totp_secret" text,
	"recovery_codes" text,
	"failed_attempts" text DEFAULT '0' NOT NULL,
	"locked_until" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_security_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "task_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_code" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"reward_type" text DEFAULT 'CASH' NOT NULL,
	"reward_amount" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"reward_per_unit" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"trigger_type" text NOT NULL,
	"target_progress" numeric(20, 8) DEFAULT '1.00000000' NOT NULL,
	"unit" text DEFAULT 'Step' NOT NULL,
	"min_deposit_required" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"rule_config" text,
	"max_claims_per_user" integer DEFAULT 1 NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "task_definitions_task_code_unique" UNIQUE("task_code"),
	CONSTRAINT "task_def_reward_amount_non_negative" CHECK ("task_definitions"."reward_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_task_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"task_code" text NOT NULL,
	"claim_key" text DEFAULT 'DEFAULT' NOT NULL,
	"reward_amount" numeric(20, 8) NOT NULL,
	"reward_type" text DEFAULT 'CASH' NOT NULL,
	"claim_metadata" text,
	"transaction_id" uuid,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_task_claims_reward_non_negative" CHECK ("user_task_claims"."reward_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "treasury_wallets" DROP CONSTRAINT "treasury_wallets_network_unique";--> statement-breakpoint
ALTER TABLE "treasury_wallets" ALTER COLUMN "hot_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ALTER COLUMN "cold_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ALTER COLUMN "hot_balance" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ALTER COLUMN "cold_balance" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "trial_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "wallet_type" text DEFAULT 'HOT' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "wallet_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "label" text DEFAULT 'Treasury Wallet' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "address" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "status" text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "priority" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_security" ADD CONSTRAINT "admin_security_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_task_claims" ADD CONSTRAINT "user_task_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_task_claims" ADD CONSTRAINT "user_task_claims_task_id_task_definitions_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_task_claims" ADD CONSTRAINT "user_task_claims_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_security_user_idx" ON "admin_security" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_def_code_idx" ON "task_definitions" USING btree ("task_code");--> statement-breakpoint
CREATE INDEX "task_def_category_idx" ON "task_definitions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "task_def_active_idx" ON "task_definitions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_task_claims_user_idx" ON "user_task_claims" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_task_claims_task_idx" ON "user_task_claims" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "user_task_claims_unique_claim" ON "user_task_claims" USING btree ("user_id","task_code","claim_key");--> statement-breakpoint
CREATE INDEX "treasury_wallets_net_type_idx" ON "treasury_wallets" USING btree ("network","wallet_type","wallet_number");