import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

  // Fetch chart data for the logged-in staff member and forward cookie for auth
  const chartUrl = new URL("/api/staff/chart", origin);
  const chartResponse = await fetch(chartUrl, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  const chart: { data?: any[]; config?: any } | null = chartResponse.ok
    ? await chartResponse.json()
    : null;

  if (!chartResponse.ok) {
    console.error(
      "/api/staff/chart",
      chartResponse.status,
      chartResponse.statusText,
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

  // Fetch my tasks for the overview table
  const tasksUrl = new URL("/api/staff/my-tasks", origin);
  const tasksResponse = await fetch(tasksUrl, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  const tasksJson = tasksResponse.ok
    ? await tasksResponse.json()
    : { tasks: [] };
  const myTasks: Array<any> = Array.isArray(tasksJson?.tasks)
    ? tasksJson.tasks
    : [];

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
                  data={chart?.data ?? chartAreaData.data}
                  config={chart?.config ?? chartAreaData.config}
                  loading={!chart}
                />
              </div>

              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">My Tasks Overview</h2>
                    <p className="text-sm text-muted-foreground">
                      Overview of tasks assigned to you.
                    </p>
                  </div>
                </div>
                <div className="rounded-md border bg-card p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned By</TableHead>
                        <TableHead>Due</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myTasks.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">
                            {t.title}
                          </TableCell>
                          <TableCell>{t.priority}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                String(t.status).toLowerCase() === "completed"
                                  ? "default"
                                  : String(t.status).toLowerCase() === "review"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {t.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{t.createdBy || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {t.dueAt
                              ? new Date(t.dueAt).toLocaleDateString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
