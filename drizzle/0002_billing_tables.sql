CREATE TYPE "public"."invoice_status" AS ENUM('Paid', 'Due', 'Overdue');--> statement-breakpoint

CREATE TABLE "billing_plans" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "price_monthly_cents" integer DEFAULT 0 NOT NULL,
    "price_yearly_cents" integer DEFAULT 0 NOT NULL,
    "seats" integer,
    "features" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "billing_plans" ADD CONSTRAINT "billing_plans_slug_unique" UNIQUE("slug");--> statement-breakpoint

CREATE TABLE "billing_invoices" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    "invoice_number" text NOT NULL,
    "tenant_id" uuid NOT NULL,
    "plan_id" uuid,
    "plan_name" text,
    "amount_cents" integer NOT NULL,
    "currency" text DEFAULT 'USD' NOT NULL,
    "status" "invoice_status" DEFAULT 'Due' NOT NULL,
    "issued_at" timestamp with time zone DEFAULT now() NOT NULL,
    "due_at" timestamp with time zone,
    "period_start" timestamp with time zone,
    "period_end" timestamp with time zone,
    "meta" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_invoice_number_unique" UNIQUE("invoice_number");--> statement-breakpoint
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_plan_id_billing_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "billing_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "billing_invoices_tenant_idx" ON "billing_invoices" ("tenant_id");--> statement-breakpoint
CREATE INDEX "billing_invoices_status_idx" ON "billing_invoices" ("status");--> statement-breakpoint
CREATE INDEX "billing_invoices_issued_at_idx" ON "billing_invoices" ("issued_at");
