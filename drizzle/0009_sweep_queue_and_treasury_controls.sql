CREATE TABLE "sweep_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deposit_id" uuid,
	"user_id" uuid NOT NULL,
	"deposit_address" text NOT NULL,
	"network" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"gas_status" text DEFAULT 'LOW' NOT NULL,
	"gas_tx_hash" text,
	"sweep_tx_hash" text,
	"error_message" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"eligible_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "native_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "sweep_mode" text DEFAULT 'AUTOMATIC' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "sweep_delay" text DEFAULT 'IMMEDIATE' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "custom_delay_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "paused" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sweep_queue" ADD CONSTRAINT "sweep_queue_deposit_id_deposits_id_fk" FOREIGN KEY ("deposit_id") REFERENCES "public"."deposits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sweep_queue" ADD CONSTRAINT "sweep_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sweep_queue_status_idx" ON "sweep_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sweep_queue_deposit_id_idx" ON "sweep_queue" USING btree ("deposit_id");