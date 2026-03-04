import type { SidebarData } from "@/components/app-sidebar";

const sidebarData = {
  user: {
    name: "Tenant Admin",
    email: "admin@acme-corp.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: "dashboard",
    },
    {
      title: "Users & Roles",
      url: "/admin/users_roles",
      icon: "team",
    },
    {
      title: "Teams",
      url: "/admin/teams",
      icon: "projects",
    },
    {
      title: "Tasks",
      url: "/admin/tasks",
      icon: "lifecycle",
    },
    {
      title: "Assets",
      url: "/admin/assets",
      icon: "database",
    },
    // {
    //   title: "Reports",
    //   url: "/admin/reports",
    //   icon: "report",
    // },
    {
      title: "Billing",
      url: "/admin/billing",
      icon: "database",
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: "settings",
    },
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "/admin/get_help",
      icon: "help",
    },
    // {
    //   title: "Search",
    //   url: "/admin/search",
    //   icon: "search",
    // },
  ],
  documents: [
    // {
    //   name: "Task Reports",
    //   url: "/admin/reports",
    //   icon: "report",
    // },
    {
      name: "Asset Inventory",
      url: "/admin/assets",
      icon: "database",
    },
    {
      name: "Team Roster",
      url: "/admin/teams",
      icon: "fileDescription",
    },
  ],
} satisfies SidebarData;

export default sidebarData;
