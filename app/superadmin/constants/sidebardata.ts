import type { SidebarData } from "@/components/app-sidebar";

const sidebarData = {
  user: {
    name: "Platform Superadmin",
    email: "superadmin@oms.local",
    avatar: "/avatars/superadmin.jpg",
  },
  navMain: [
    {
      title: "Platform Dashboard",
      url: "/superadmin",
      icon: "dashboard",
    },
    {
      title: "Tenants",
      url: "/superadmin/tenants",
      icon: "projects",
    },
    {
      title: "Billing & Plans",
      url: "/superadmin/billing_and_plans",
      icon: "report",
    },
    {
      title: "Payment Confirmations",
      url: "/superadmin/payment_confirmations",
      icon: "fileDescription",
    },
    {
      title: "Platform Settings",
      url: "/superadmin/platform_settings",
      icon: "settings",
    },
    {
      title: "Audit & Logs",
      url: "/superadmin/audit_logs",
      icon: "report",
    },
  ],
  navClouds: [
    {
      title: "Provisioning",
      icon: "fileDescription",
      url: "/superadmin/provisioning",
      items: [
        { title: "Create Tenant", url: "/superadmin/tenants/new" },
        { title: "Tenant Templates", url: "/superadmin/tenants/templates" },
      ],
    },
    {
      title: "Support",
      icon: "help",
      url: "/superadmin/support",
      items: [
        { title: "Incidents", url: "/superadmin/support/incidents" },
        { title: "Impersonate Admin", url: "/superadmin/support/impersonate" },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "/superadmin/get_help",
      icon: "help",
    },
    {
      title: "Search",
      url: "/superadmin/search",
      icon: "search",
    },
  ],
  documents: [
    {
      name: "Tenant Registry",
      url: "/superadmin/tenant_registry",
      icon: "database",
    },
    {
      name: "Billing Reports",
      url: "/superadmin/billing_reports",
      icon: "report",
    },
    {
      name: "Platform Docs",
      url: "/superadmin/platform_docs",
      icon: "fileDescription",
    },
  ],
} satisfies SidebarData;

export default sidebarData;
