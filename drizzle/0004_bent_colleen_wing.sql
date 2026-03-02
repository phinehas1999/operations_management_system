CREATE TYPE "public"."asset_status" AS ENUM('Active', 'Inactive');--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "status" "asset_status" DEFAULT 'Active' NOT NULL;