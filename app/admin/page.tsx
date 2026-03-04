"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards, type SectionCard } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import * as React from "react";

import data from "./constants/DataTableData";
import siteHeaderData from "./constants/siteheaderdata";
import sidebarData from "./constants/sidebardata";
import chartAreaData from "./constants/chartAreadata";

export default function Page() {
  const [cards, setCards] = React.useState<SectionCard[] | null>(null);
  const [loadingCards, setLoadingCards] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function loadMetrics() {
      try {
        const tenantRes = await fetch("/api/tenant/current");
        if (!tenantRes.ok) throw new Error("Missing tenant context");
        const tenant = await tenantRes.json();
        if (!tenant?.id) throw new Error("Tenant not found");

        const [tasksRes, assetsRes, invoicesRes] = await Promise.all([
          fetch("/api/admin/tasks"),
          fetch("/api/admin/assets"),
          fetch(`/api/superadmin/invoices?tenantId=${tenant.id}`),
        ]);

        if (!tasksRes.ok || !assetsRes.ok || !invoicesRes.ok) {
          throw new Error("Failed to load metrics");
        }

        const [tasksBody, assetsBody, invoicesBody] = await Promise.all([
          tasksRes.json(),
          assetsRes.json(),
          invoicesRes.json(),
        ]);

        const tasksCount = Array.isArray(tasksBody?.tasks)
          ? tasksBody.tasks.length
          : 0;
        const assets = Array.isArray(assetsBody) ? assetsBody : [];
        const totalAssets = assets.length;
        const inactiveAssets = assets.filter((asset) =>
          typeof asset?.status === "string"
            ? asset.status.toLowerCase() !== "active"
            : false,
        ).length;
        const invoices = Array.isArray(invoicesBody) ? invoicesBody : [];
        const unpaidInvoices = invoices.filter(
          (invoice) => (invoice?.status || "").toLowerCase() !== "paid",
        ).length;

        const next: SectionCard[] = [
          {
            description: "Total Tasks",
            title: String(tasksCount),
            badgeText: "Live",
            trend: "up",
            footerHeadline: "Tasks for your tenant",
            footerSub: "Loaded from tasks API",
          },
          {
            description: "Total Assets",
            title: String(totalAssets),
            badgeText: "Live",
            trend: "up",
            footerHeadline: "Assets tracked",
            footerSub: "Includes active and inactive",
          },
          {
            description: "Inactive Assets",
            title: String(inactiveAssets),
            badgeText: "Alert",
            trend: "down",
            footerHeadline: "Assets needing attention",
            footerSub: "Status set to inactive",
          },
          {
            description: "Unpaid Invoices",
            title: String(unpaidInvoices),
            badgeText: "Due",
            trend: "down",
            footerHeadline: "Invoices not paid",
            footerSub: "Issued by superadmin",
          },
        ];

        if (!mounted) return;
        setCards(next);
      } catch (err) {
        if (!mounted) return;
        setCards([
          {
            description: "Total Tasks",
            title: "—",
            badgeText: "Error",
            trend: "down",
            footerHeadline: "Unable to load",
            footerSub: "Check API",
          },
          {
            description: "Total Assets",
            title: "—",
            badgeText: "Error",
            trend: "down",
            footerHeadline: "Unable to load",
            footerSub: "Check API",
          },
          {
            description: "Inactive Assets",
            title: "—",
            badgeText: "Error",
            trend: "down",
            footerHeadline: "Unable to load",
            footerSub: "Check API",
          },
          {
            description: "Unpaid Invoices",
            title: "—",
            badgeText: "Error",
            trend: "down",
            footerHeadline: "Unable to load",
            footerSub: "Check API",
          },
        ]);
      } finally {
        if (mounted) setLoadingCards(false);
      }
    }

    loadMetrics();
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
              <SectionCards items={cards ?? []} loading={loadingCards} />
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
