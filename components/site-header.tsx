"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function SiteHeader({siteheaderdata}: {siteheaderdata?: any}) {
  const [theme, setTheme] = React.useState<"light" | "dark" | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
      } else {
        // respect system preference
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

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{siteheaderdata?.title ?? "Documents"}</h1>
        <div className="ml-auto flex items-center gap-2">
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
      </div>
    </header>
  );
}
