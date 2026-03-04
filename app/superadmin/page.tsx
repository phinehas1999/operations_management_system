"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import * as React from "react";
import { SectionCards, type SectionCard } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import siteHeaderData from "./constants/siteheaderdata";
import sidebarData from "./constants/sidebardata";
// sectionCardsData replaced by live cards loaded below
import chartAreaData from "./constants/chartAreadata";
import type { ChartConfig } from "@/components/ui/chart";

type TenantRow = {
  id?: string | null;
  name?: string | null;
  status?: string | null;
  createdAt?: string | Date | null;
};

function isoDayUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildTenantSeries(tenants: TenantRow[] = [], days = 180) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - Math.max(1, days - 1));

  const createdTimes = tenants
    .map((t) => {
      const v = t?.createdAt;
      const dt = v instanceof Date ? v : new Date(v as any);
      const time = dt.getTime();
      return Number.isFinite(time) ? time : null;
    })
    .filter((t): t is number => typeof t === "number")
    .sort((a, b) => a - b);

  let idx = 0;
  while (idx < createdTimes.length && createdTimes[idx] < start.getTime())
    idx++;

  let running = idx;
  const points: Array<{ date: string; tenants: number }> = [];

  for (let t = start.getTime(); t <= end.getTime(); t += 24 * 60 * 60 * 1000) {
    const dayStart = t;
    const dayEnd = t + 24 * 60 * 60 * 1000;
    let added = 0;
    while (idx < createdTimes.length && createdTimes[idx] < dayEnd) {
      if (createdTimes[idx] >= dayStart) added++;
      idx++;
    }
    running += added;
    points.push({ date: isoDayUTC(new Date(dayStart)), tenants: running });
  }

  const config: ChartConfig = {
    tenants: { label: "Tenants", color: "var(--chart-1)" },
  };

  return { data: points, config };
}

export default function Page() {
  const [cards, setCards] = React.useState<SectionCard[] | null>(null);
  const [tenantsChart, setTenantsChart] = React.useState<any>(
    () => chartAreaData,
  );
  const [recentTenants, setRecentTenants] = React.useState<TenantRow[]>([]);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [tenantsRes, invoicesRes, plansRes, confirmationsRes] =
          await Promise.all([
            fetch("/api/superadmin/tenants"),
            fetch("/api/superadmin/invoices"),
            fetch("/api/superadmin/plans"),
            fetch("/api/superadmin/payment-confirmations"),
          ]);

        if (
          !tenantsRes.ok ||
          !invoicesRes.ok ||
          !plansRes.ok ||
          !confirmationsRes.ok
        ) {
          throw new Error("Failed to load dashboard stats");
        }

        const [tenants, invoices, plans, confirmations] = await Promise.all([
          tenantsRes.json(),
          invoicesRes.json(),
          plansRes.json(),
          confirmationsRes.json(),
        ]);

        const tenantCount = Array.isArray(tenants) ? tenants.length : 0;
        const planCount = Array.isArray(plans) ? plans.length : 0;

        if (mounted && Array.isArray(tenants)) {
          const tenantList = tenants as TenantRow[];
          setTenantsChart(buildTenantSeries(tenantList, 180));
          setRecentTenants(tenantList);
        }

        const paidCents = (Array.isArray(invoices) ? invoices : []).reduce(
          (s: number, i: any) =>
            s + (i?.status === "Paid" ? Number(i.amountCents || 0) : 0),
          0,
        );

        const pendingApprovals = (
          Array.isArray(confirmations) ? confirmations : []
        ).filter((c: any) => c.status === "Pending").length;

        const next: SectionCard[] = [
          {
            description: "Total Tenants",
            title: String(tenantCount),
            badgeText: "Live",
            trend: "up",
            footerHeadline: "Active tenant accounts",
            footerSub: "Provisioned and active tenants",
          },
          {
            description: "Platform Revenue",
            title: (paidCents / 100).toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }),
            badgeText: "Paid",
            trend: "up",
            footerHeadline: "Total paid to date",
            footerSub: "Based on paid invoices",
          },
          {
            description: "Pending Approvals",
            title: String(pendingApprovals),
            badgeText: "Review",
            trend: "down",
            footerHeadline: "Awaiting verification",
            footerSub: "Payment confirmations pending",
          },
          {
            description: "Available Subscription Tiers",
            title: String(planCount),
            badgeText: "Active",
            trend: "up",
            footerHeadline: "Plans available",
            footerSub: "From billing plans",
          },
        ];

        if (mounted) setCards(next);
      } catch (err) {
        if (mounted)
          setCards([
            {
              description: "Total Tenants",
              title: "—",
              badgeText: "Error",
              trend: "down",
              footerHeadline: "Unable to load",
              footerSub: "Check API",
            },
            {
              description: "Platform Revenue",
              title: "—",
              badgeText: "Error",
              trend: "down",
              footerHeadline: "Unable to load",
              footerSub: "Check API",
            },
            {
              description: "Pending Approvals",
              title: "—",
              badgeText: "Error",
              trend: "down",
              footerHeadline: "Unable to load",
              footerSub: "Check API",
            },
            {
              description: "Available Subscription Tiers",
              title: "—",
              badgeText: "Error",
              trend: "down",
              footerHeadline: "Unable to load",
              footerSub: "Check API",
            },
          ]);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

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
              <SectionCards items={cards ?? []} loading={cards === null} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive
                  data={tenantsChart.data}
                  config={tenantsChart.config}
                />
              </div>
              <RecentTenantsTable tenants={recentTenants} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function RecentTenantsTable({ tenants }: { tenants: TenantRow[] }) {
  const sortedTenants = React.useMemo(() => {
    return [...tenants].sort((a, b) => {
      const aTime = new Date(a.createdAt ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
  }, [tenants]);
  const displayTenants = React.useMemo(
    () => sortedTenants.slice(0, 10),
    [sortedTenants],
  );

  return (
    <div className="px-4 lg:px-6">
      <div className="overflow-hidden rounded-lg border">
        <div className="px-4 lg:px-6 py-3 border-b">
          <p className="text-lg font-semibold">Recent Tenants</p>
          <p className="text-sm text-muted-foreground">
            Ordered by newest creation date.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-1/3 text-center">Name</TableHead>
                <TableHead className="w-1/3 text-center">Status</TableHead>
                <TableHead className="w-1/3 text-center">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {displayTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No tenants yet.
                  </TableCell>
                </TableRow>
              ) : (
                displayTenants.map((tenant, index) => {
                  const created = tenant.createdAt
                    ? new Date(tenant.createdAt)
                    : null;

                  const rowKey =
                    tenant.id ?? `${tenant.name ?? "tenant"}-${index}`;

                  return (
                    <TableRow
                      key={rowKey}
                      className="hover:bg-muted/5 data-[state=selected]:bg-muted"
                    >
                      <TableCell className="font-medium text-center">
                        {tenant.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        {tenant.status ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center">
                        {created
                          ? created.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
