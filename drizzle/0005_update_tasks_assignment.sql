-- Create tasks table (idempotent) and add assignment/creator support
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "assignee_id" uuid,
    "assignee_team_id" uuid,
    "assignee_type" text NOT NULL DEFAULT 'UNASSIGNED',
    "status" text NOT NULL DEFAULT 'pending',
    "priority" text NOT NULL DEFAULT 'medium',
    "meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "due_at" timestamp with time zone,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_team_id_teams_id_fk" FOREIGN KEY ("assignee_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- For existing deployments, coerce priority/status to text and add missing columns/defaults
alter table "tasks" alter column "priority" type text using "priority"::text;
alter table "tasks" alter column "priority" set default 'medium';
alter table "tasks" alter column "status" set default 'pending';
alter table "tasks" add column if not exists "assignee_team_id" uuid;
alter table "tasks" add column if not exists "assignee_type" text not null default 'UNASSIGNED';
alter table "tasks" add column if not exists "created_by" uuid;
