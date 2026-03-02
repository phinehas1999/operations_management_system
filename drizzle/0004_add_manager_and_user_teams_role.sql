-- Add manager_id to teams and role to user_teams
ALTER TABLE IF EXISTS public.teams
  ADD COLUMN IF NOT EXISTS manager_id uuid;

DO $$ BEGIN
  ALTER TABLE public.teams ADD CONSTRAINT teams_manager_id_users_id_fk FOREIGN KEY (manager_id) REFERENCES public.users(id) ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE IF EXISTS public.user_teams
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'STAFF' NOT NULL;
