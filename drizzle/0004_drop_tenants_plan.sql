-- Remove legacy tenants.plan enum column now that plan_id is authoritative
ALTER TABLE tenants DROP COLUMN IF EXISTS plan;

-- Drop the old enum type if nothing else uses it
DROP TYPE IF EXISTS "plan";
