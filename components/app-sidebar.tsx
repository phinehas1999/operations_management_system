"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import sidebarData from "@/app/superadmin/constants/sidebardata";
import { Button } from "@/components/ui/button";
import { IconSun, IconMoon } from "@tabler/icons-react";

const iconMap = {
  dashboard: IconDashboard,
  lifecycle: IconListDetails,
  analytics: IconChartBar,
  projects: IconFolder,
  team: IconUsers,
  camera: IconCamera,
  fileDescription: IconFileDescription,
  fileAi: IconFileAi,
  settings: IconSettings,
  help: IconHelp,
  search: IconSearch,
  database: IconDatabase,
  report: IconReport,
  word: IconFileWord,
} as const;

type IconKey = keyof typeof iconMap;

export type SidebarData = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  navMain: {
    title: string;
    url: string;
    icon?: IconKey;
  }[];
  navClouds?: {
    title: string;
    icon: IconKey;
    isActive?: boolean;
    url: string;
    items: {
      title: string;
      url: string;
    }[];
  }[];
  navSecondary: {
    title: string;
    url: string;
    icon: IconKey;
  }[];
  documents: {
    name: string;
    url: string;
    icon: IconKey;
  }[];
};

function withOptionalIcons<T extends { icon?: IconKey }>(items: T[]) {
  return items.map((item) => ({
    ...item,
    icon: item.icon ? iconMap[item.icon] : undefined,
  }));
}

function withRequiredIcons<T extends { icon: IconKey }>(items: T[]) {
  return items.map((item) => ({
    ...item,
    icon: iconMap[item.icon],
  }));
}

export function AppSidebar({
  sidedebardata,
  ...props
}: React.ComponentProps<typeof Sidebar> & { sidedebardata?: SidebarData }) {
  const [theme, setTheme] = React.useState<"light" | "dark" | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
      } else {
        const prefersDark = window.matchMedia?.(
          "(prefers-color-scheme: dark)",
        ).matches;
        setTheme(prefersDark ? "dark" : "light");
        document.documentElement.classList.toggle("dark", prefersDark);
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  function setMode(mode: "light" | "dark") {
    try {
      setTheme(mode);
      localStorage.setItem("theme", mode);
      document.documentElement.classList.toggle("dark", mode === "dark");
    } catch (e) {
      /* ignore */
    }
  }
  const resolvedData = React.useMemo(() => {
    const data = (sidedebardata ?? sidebarData) as SidebarData;

    return {
      user: data.user,
      navMain: withOptionalIcons(data.navMain),
      navSecondary: withRequiredIcons(data.navSecondary),
      documents: withRequiredIcons(data.documents),
    };
  }, [sidedebardata]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">OMS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={resolvedData.navMain} />
        <NavDocuments items={resolvedData.documents} />
        <NavSecondary items={resolvedData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="hidden sm:flex items-center gap-1 rounded-lg border px-1 py-0.5">
            <Button
              size="sm"
              variant={theme === "light" ? "ghost" : "outline"}
              onClick={() => setMode("light")}
              className={`flex items-center gap-2 px-2 ${theme === "light" ? "bg-yellow-100 text-yellow-800" : ""}`}
            >
              <IconSun className="size-4" />
              <span className="sr-only">Light</span>
            </Button>
            <Button
              size="sm"
              variant={theme === "dark" ? "ghost" : "outline"}
              onClick={() => setMode("dark")}
              className={`flex items-center gap-2 px-2 ${theme === "dark" ? "bg-sky-800 text-white" : ""}`}
            >
              <IconMoon className="size-4" />
              <span className="sr-only">Dark</span>
            </Button>
          </div>
        </div>
        <NavUser user={resolvedData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
