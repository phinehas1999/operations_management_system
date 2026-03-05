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

type ManagerMetrics = {
  myTasksCount: number;
  pendingTasksCount: number;
  myTeamCount: number;
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

  const metricsUrl = new URL("/api/manager/metrics", origin);
  const cookie = nextHeaders.get("cookie") ?? "";
  const metricsResponse = await fetch(metricsUrl, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  const metrics: ManagerMetrics | null = metricsResponse.ok
    ? await metricsResponse.json()
    : null;

  if (!metricsResponse.ok) {
    console.error(
      "/api/manager/metrics",
      metricsResponse.status,
      metricsResponse.statusText,
    );
  }

  const numberFormatter = new Intl.NumberFormat("en-US");
  const formatNumber = (value: number) => numberFormatter.format(value);
  const pendingTrend =
    metrics && metrics.pendingTasksCount === 0 ? "down" : "up";

  const sectionCards: SectionCard[] = [
    {
      description: "My Tasks",
      title: metrics ? formatNumber(metrics.myTasksCount) : "—",
      badgeText: "Assigned",
      trend: "up",
      footerHeadline: "Tasks owned by you",
      footerSub: "Includes personal assignments",
    },
    {
      description: "Pending Tasks",
      title: metrics ? formatNumber(metrics.pendingTasksCount) : "—",
      badgeText: "Pending",
      trend: pendingTrend,
      footerHeadline: "Waiting on action",
      footerSub: "Tasks requiring follow-up",
    },
    {
      description: "My Team",
      title: metrics ? formatNumber(metrics.myTeamCount) : "—",
      badgeText: "Staff",
      trend: "up",
      footerHeadline: "Assigned staff",
      footerSub: "Members of your managed teams",
    },
    {
      description: "Assets",
      title: metrics ? formatNumber(metrics.assetCount) : "—",
      badgeText: "Inventory",
      trend: "up",
      footerHeadline: "Tenant assets",
      footerSub: "Trackable resources for your tenant",
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
