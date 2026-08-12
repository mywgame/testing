CREATE TABLE "treasury_sweep_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"network" text NOT NULL,
	"source_address" text NOT NULL,
	"destination_address" text NOT NULL,
	"sweep_type" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"tx_hash" text,
	"status" text NOT NULL,
	"error_message" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treasury_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"network" text NOT NULL,
	"hot_address" text NOT NULL,
	"cold_address" text NOT NULL,
	"hot_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"cold_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
	"auto_sweep_enabled" boolean DEFAULT true NOT NULL,
	"auto_sweep_threshold" numeric(20, 8) DEFAULT '50.00000000' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "treasury_wallets_network_unique" UNIQUE("network")
);
--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "on_chain_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;