ALTER TABLE "treasury_wallets" DROP CONSTRAINT "treasury_wallets_network_unique";--> statement-breakpoint
DROP INDEX "deposit_addresses_user_network_idx";--> statement-breakpoint
ALTER TABLE "treasury_wallets" ALTER COLUMN "hot_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ALTER COLUMN "cold_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ALTER COLUMN "hot_balance" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ALTER COLUMN "cold_balance" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "trial_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "rotated_at" timestamp;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "rotated_by" uuid;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "rotation_reason" text;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "replaced_by_address_id" uuid;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "wallet_type" text DEFAULT 'HOT' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "wallet_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "label" text DEFAULT 'Treasury Wallet' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "address" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "status" text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "priority" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "treasury_wallets" ADD COLUMN "balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD CONSTRAINT "deposit_addresses_rotated_by_users_id_fk" FOREIGN KEY ("rotated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD CONSTRAINT "deposit_addresses_replaced_by_address_id_deposit_addresses_id_fk" FOREIGN KEY ("replaced_by_address_id") REFERENCES "public"."deposit_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "deposit_addresses_active_user_network_idx" ON "deposit_addresses" USING btree ("user_id","network") WHERE "deposit_addresses"."is_active" = true;--> statement-breakpoint
CREATE INDEX "treasury_wallets_net_type_idx" ON "treasury_wallets" USING btree ("network","wallet_type","wallet_number");