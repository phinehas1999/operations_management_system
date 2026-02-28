CREATE TYPE "public"."plan" AS ENUM('Trial', 'Basic', 'Pro', 'Enterprise');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('Active', 'Suspended');--> statement-breakpoint
UPDATE "tenants"
SET "plan" = CASE
	WHEN "plan" ILIKE 'standard' THEN 'Basic'
	WHEN "plan" IS NULL THEN 'Trial'
	ELSE "plan"
END
WHERE "plan" IS NULL OR "plan" NOT IN ('Trial', 'Basic', 'Pro', 'Enterprise');--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "plan" SET DEFAULT 'Trial'::"public"."plan";--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "plan" SET DATA TYPE "public"."plan" USING "plan"::"public"."plan";--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "plan" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "status" "tenant_status" DEFAULT 'Active' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "seats" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "admin_email" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "monthly_revenue" integer DEFAULT 0 NOT NULL;