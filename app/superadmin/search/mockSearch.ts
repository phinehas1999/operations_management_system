const results = [
  {
    id: "res_001",
    type: "tenant",
    title: "Acme Corp",
    snippet: "Tenant: acme-corp — Pro plan, 12 seats",
    link: "/superadmin/tenant_registry/acme-corp",
    date: "2025-08-12T10:15:00Z",
  },
  {
    id: "res_002",
    type: "doc",
    title: "Billing Overview",
    snippet: "How billing works: plans, invoices, and exports.",
    link: "/superadmin/platform_docs/billing-overview",
    date: "2026-02-10T12:30:00Z",
  },
  {
    id: "res_003",
    type: "invoice",
    title: "Invoice 2026-0002",
    snippet: "Beta LLC — Due — $199",
    link: "/superadmin/billing_and_plans/invoices/2026-0002",
    date: "2026-02-01T00:00:00Z",
  },
  {
    id: "res_004",
    type: "log",
    title: "billing.failed",
    snippet: "Payment gateway returned 402 for tenant Beta LLC",
    link: "/superadmin/audit_logs",
    date: "2026-02-24T09:45:33Z",
  },
];

export default results;
