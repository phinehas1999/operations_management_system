const plans = [
  {
    id: "plan_free",
    name: "Free",
    slug: "free",
    priceMonthly: 0,
    priceYearly: 0,
    seats: 3,
    features: ["Basic tasks", "1 team", "Email support"],
    createdAt: "2025-01-01",
  },
  {
    id: "plan_pro",
    name: "Pro",
    slug: "pro",
    priceMonthly: 29,
    priceYearly: 299,
    seats: 25,
    features: ["Unlimited tasks", "Teams", "Priority support"],
    createdAt: "2025-01-01",
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    slug: "enterprise",
    priceMonthly: 199,
    priceYearly: 1999,
    seats: "Custom",
    features: ["SAML SSO", "Dedicated support", "Custom SLAs"],
    createdAt: "2025-01-01",
  },
];

export default plans;
