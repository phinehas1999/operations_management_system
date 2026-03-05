import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import type { SectionCard } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { headers } from "next/headers";

import data from "./constants/DataTableData";
import siteHeaderData from "./constants/siteheaderdata";
import sidebarData from "./constants/sidebardata";
import chartAreaData from "./constants/chartAreadata";

type StaffMetrics = {
  myTasksCount: number;
  inProgressCount: number;
  pendingTasksCount: number;
  assetCount: number;
};

export default async function Page() {
  const nextHeaders = await headers();
  const forwardedHost =
    nextHeaders.get("x-forwarded-host") ?? nextHeaders.get("host");
  const forwardedProto = nextHeaders.get("x-forwarded-proto") ?? "http";

  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : (process.env.NEXTAUTH_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"));

  const metricsUrl = new URL("/api/staff/metrics", origin);
  const cookie = nextHeaders.get("cookie") ?? "";
  const metricsResponse = await fetch(metricsUrl, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  const metrics: StaffMetrics | null = metricsResponse.ok
    ? await metricsResponse.json()
    : null;

  if (!metricsResponse.ok) {
    console.error(
      "/api/staff/metrics",
      metricsResponse.status,
      metricsResponse.statusText,
    );
  }

  const numberFormatter = new Intl.NumberFormat("en-US");
  const formatNumber = (value: number) => numberFormatter.format(value);
  const sectionCards: SectionCard[] = [
    {
      description: "My Tasks",
      title: metrics ? formatNumber(metrics.myTasksCount) : "—",
      badgeText: "Assigned",
      trend: "up",
      footerHeadline: "Tasks assigned to you",
      footerSub: "Personal workload",
    },
    {
      description: "In Progress",
      title: metrics ? formatNumber(metrics.inProgressCount) : "—",
      badgeText: "Active",
      trend: "up",
      footerHeadline: "In-progress tasks",
      footerSub: "Work underway",
    },
    {
      description: "Pending Tasks",
      title: metrics ? formatNumber(metrics.pendingTasksCount) : "—",
      badgeText: "Pending",
      trend: "down",
      footerHeadline: "Awaiting action",
      footerSub: "Need follow-up",
    },
    {
      description: "Assets",
      title: metrics ? formatNumber(metrics.assetCount) : "—",
      badgeText: "Inventory",
      trend: "up",
      footerHeadline: "Tenant assets",
      footerSub: "Available resources",
    },
  ];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" sidedebardata={sidebarData} />
      <SidebarInset>
        <SiteHeader siteheaderdata={siteHeaderData} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards items={sectionCards} loading={!metrics} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive
                  data={chartAreaData.data}
                  config={chartAreaData.config}
                />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
