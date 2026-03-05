import type { SidebarData } from "@/components/app-sidebar";

const sidebarData = {
  user: {
    name: "Staff Member",
    email: "staff@acme-corp.com",
    avatar: "/avatars/staff.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/staff",
      icon: "dashboard",
    },
    {
      title: "My Tasks",
      url: "/staff/my_tasks",
      icon: "lifecycle",
    },
    {
      title: "Assets",
      url: "/staff/assets",
      icon: "database",
    },
    // {
    //   title: "Notifications",
    //   url: "/staff/notifications",
    //   icon: "fileDescription",
    // },
  ],
  navSecondary: [
    // {
    //   title: "Get Help",
    //   url: "/staff/get_help",
    //   icon: "help",
    // },
    // {
    //   title: "Search",
    //   url: "/staff/search",
    //   icon: "search",
    // },
  ],
  documents: [
    {
      name: "My Tasks",
      url: "/staff/my_tasks",
      icon: "lifecycle",
    },
    {
      name: "Asset Inventory",
      url: "/staff/assets",
      icon: "database",
    },
    // {
    //   name: "Notifications",
    //   url: "/staff/notifications",
    //   icon: "fileDescription",
    // },
  ],
} satisfies SidebarData;

export default sidebarData;
