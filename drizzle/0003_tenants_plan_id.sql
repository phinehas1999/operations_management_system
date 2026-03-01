-- Add plan_id to tenants and populate from existing tenants.plan values
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_id uuid;

-- Map existing enum values to billing_plans.slug and set plan_id where possible
UPDATE tenants
SET plan_id = bp.id
FROM billing_plans bp
WHERE bp.slug = CASE tenants.plan
  WHEN 'Trial' THEN 'free'
  WHEN 'Basic' THEN 'basic'
  WHEN 'Pro' THEN 'pro'
  WHEN 'Enterprise' THEN 'enterprise'
  ELSE NULL
END;

-- Add foreign key constraint
ALTER TABLE tenants
  ADD CONSTRAINT tenants_plan_id_billing_plans_id_fk
  FOREIGN KEY (plan_id) REFERENCES billing_plans(id) ON DELETE SET NULL;

-- Optional: keep the old tenants.plan enum column for backward compatibility.
-- Future: you may drop tenants.plan once all code uses plan_id.
