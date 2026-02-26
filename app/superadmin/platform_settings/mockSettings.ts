const platformSettings = [
  {
    id: "site",
    key: "platformName",
    label: "Platform Name",
    type: "text",
    value: "Smart OMS",
    description: "Displayed in emails and the admin header.",
  },
  {
    id: "email",
    key: "supportEmail",
    label: "Support Email",
    type: "text",
    value: "support@example.com",
    description: "Public support address for tenant-facing communication.",
  },
  {
    id: "domain",
    key: "allowedDomains",
    label: "Allowed Domains",
    type: "list",
    value: ["example.com"],
    description: "Tenant provisioning allowed domains (comma separated).",
  },
  {
    id: "billing",
    key: "billingEnabled",
    label: "Billing Enabled",
    type: "boolean",
    value: true,
    description: "Enable platform billing features and invoicing.",
  },
  {
    id: "signup",
    key: "openSignup",
    label: "Open Signup",
    type: "boolean",
    value: false,
    description: "Allow new tenants to sign up without invite.",
  },
];

export default platformSettings;
