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
      url: "/superadmin/billing",
      icon: "report",
    },
    {
      title: "Platform Settings",
      url: "/superadmin/settings",
      icon: "settings",
    },
    {
      title: "Audit & Logs",
      url: "/superadmin/audit",
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
      title: "Settings",
      url: "/superadmin/settings",
      icon: "settings",
    },
    {
      title: "Get Help",
      url: "/superadmin/support",
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
      url: "/superadmin/tenants",
      icon: "database",
    },
    {
      name: "Billing Reports",
      url: "/superadmin/billing/reports",
      icon: "report",
    },
    {
      name: "Platform Docs",
      url: "/superadmin/docs",
      icon: "fileDescription",
    },
  ],
} satisfies SidebarData;

export default sidebarData;
