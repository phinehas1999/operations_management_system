"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import results from "./mockSearch";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return results.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) || r.snippet.toLowerCase().includes(q)
      );
    });
  }, [query, type]);

  const formatDate = (ts?: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

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
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Search</h2>
                    <p className="text-sm text-muted-foreground">
                      Search across tenants, docs, invoices, and logs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      Advanced
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 w-full md:w-2/3">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search the platform..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="rounded-md border border-input px-3 py-2 text-sm"
                    >
                      <option value="all">All</option>
                      <option value="tenant">Tenant</option>
                      <option value="doc">Doc</option>
                      <option value="invoice">Invoice</option>
                      <option value="log">Log</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3">
                  {filtered.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-md border bg-card p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.snippet}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.type} • {formatDate(r.date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={r.link} className="text-sm text-primary">
                          Open
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
