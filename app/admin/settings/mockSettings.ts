const settings = [
  {
    id: "brand",
    key: "tenantName",
    label: "Tenant Name",
    type: "text",
    value: "Acme Corp",
    description: "Shown in the tenant header and emails.",
  },
  {
    id: "notifications",
    key: "emailNotifications",
    label: "Email Notifications",
    type: "boolean",
    value: true,
    description: "Send task updates and alerts via email.",
  },
  {
    id: "domains",
    key: "allowedDomains",
    label: "Allowed Domains",
    type: "list",
    value: ["acme-corp.com"],
    description: "Domains allowed for user invitations.",
  },
];

export default settings;
