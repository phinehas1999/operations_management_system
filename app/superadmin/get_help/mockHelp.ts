const helpItems = [
  {
    id: "help_001",
    type: "contact",
    title: "Contact Support",
    channel: "email",
    address: "support@example.com",
    availability: "24/7",
    updatedAt: "2026-02-01T08:00:00Z",
    details: "Open a support ticket via email for billing or technical issues.",
  },
  {
    id: "help_002",
    type: "faq",
    title: "How to provision a tenant",
    slug: "provision-tenant",
    updatedAt: "2025-12-10T09:30:00Z",
    summary: "Step-by-step tenant provisioning guide.",
  },
  {
    id: "help_003",
    type: "ticket",
    title: "Ticket: Billing issue for Beta LLC",
    status: "open",
    createdAt: "2026-02-20T11:12:00Z",
    owner: "ops@platform",
    details: "Invoice 2026-0002 failed payment.",
  },
];

export default helpItems;
export const helpTopics = [
  {
    id: "help_01",
    title: "How to provision a tenant",
    category: "Onboarding",
    updatedAt: "2026-01-15T10:00:00Z",
    summary:
      "Step-by-step instructions to provision and configure a new tenant.",
    link: "/superadmin/platform_docs/onboarding-guide",
  },
  {
    id: "help_02",
    title: "Troubleshooting billing failures",
    category: "Billing",
    updatedAt: "2026-02-10T09:00:00Z",
    summary: "Common reasons payments fail and how to retry payments.",
    link: "/superadmin/platform_docs/billing-overview",
  },
  {
    id: "help_03",
    title: "Configuring SSO",
    category: "Security",
    updatedAt: "2025-11-20T09:00:00Z",
    summary: "SAML setup and recommended security practices.",
    link: "/superadmin/platform_docs/security-sso",
  },
];
