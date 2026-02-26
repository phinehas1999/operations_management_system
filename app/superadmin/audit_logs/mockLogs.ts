const logs = [
  {
    id: "log_001",
    timestamp: "2026-02-25T14:12:00Z",
    user: "alice@example.com",
    action: "tenant.created",
    resource: "tenant:acme-corp",
    severity: "Info",
    details: "Created tenant Acme Corp with plan=pro",
  },
  {
    id: "log_002",
    timestamp: "2026-02-25T15:03:12Z",
    user: "bob@example.com",
    action: "user.suspended",
    resource: "user:42",
    severity: "Warning",
    details: "Suspended user due to repeated failures",
  },
  {
    id: "log_003",
    timestamp: "2026-02-24T09:45:33Z",
    user: "system",
    action: "billing.failed",
    resource: "invoice:2026-0002",
    severity: "Error",
    details: "Payment gateway returned 402 for tenant Beta LLC",
  },
  {
    id: "log_004",
    timestamp: "2026-02-20T11:22:10Z",
    user: "carol@example.com",
    action: "settings.updated",
    resource: "platform:settings",
    severity: "Info",
    details: "Toggled openSignup=false",
  },
];

export default logs;
