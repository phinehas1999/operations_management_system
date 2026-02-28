import type { SidebarData } from "@/components/app-sidebar";

const sidebarData = {
  user: {
    name: "Team Manager",
    email: "manager@acme-corp.com",
    avatar: "/avatars/manager.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/manager",
      icon: "dashboard",
    },
    {
      title: "Tasks",
      url: "/manager/tasks",
      icon: "lifecycle",
    },
    {
      title: "Assets",
      url: "/manager/assets",
      icon: "database",
    },
    {
      title: "Reports",
      url: "/manager/reports",
      icon: "report",
    },
    {
      title: "Team",
      url: "/manager/team",
      icon: "team",
    },
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "/manager/get_help",
      icon: "help",
    },
    {
      title: "Search",
      url: "/manager/search",
      icon: "search",
    },
  ],
  documents: [
    {
      name: "Team Tasks",
      url: "/manager/tasks",
      icon: "lifecycle",
    },
    {
      name: "Asset Inventory",
      url: "/manager/assets",
      icon: "database",
    },
    {
      name: "Team Roster",
      url: "/manager/team",
      icon: "fileDescription",
    },
  ],
} satisfies SidebarData;

export default sidebarData;
