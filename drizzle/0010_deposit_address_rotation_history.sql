DROP INDEX "deposit_addresses_user_network_idx";--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "rotated_at" timestamp;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "rotated_by" uuid;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "rotation_reason" text;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD COLUMN "replaced_by_address_id" uuid;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD CONSTRAINT "deposit_addresses_rotated_by_users_id_fk" FOREIGN KEY ("rotated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD CONSTRAINT "deposit_addresses_replaced_by_address_id_deposit_addresses_id_fk" FOREIGN KEY ("replaced_by_address_id") REFERENCES "public"."deposit_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "deposit_addresses_active_user_network_idx" ON "deposit_addresses" USING btree ("user_id","network") WHERE "deposit_addresses"."is_active" = true;