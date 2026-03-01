"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [plan, setPlan] = React.useState("all");
  const [registry, setRegistry] = React.useState<Array<any>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const plans = React.useMemo(
    () =>
      Array.from(
        new Set(registry.map((r) => r.planName || "Unassigned")),
      ).sort(),
    [registry],
  );
  const statuses = React.useMemo(
    () => Array.from(new Set(registry.map((r) => r.status))).sort(),
    [registry],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return registry.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (plan !== "all" && (t.planName || "Unassigned") !== plan) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.adminEmail || "").toLowerCase().includes(q)
      );
    });
  }, [query, status, plan]);

  React.useEffect(() => {
    let mounted = true;
    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/superadmin/tenants", {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch tenants");
        const data = await res.json();
        if (!mounted) return;
        setRegistry(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err?.message ?? "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, []);

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  function exportCsv(rows: typeof registry, name = "tenants.csv") {
    if (!rows.length) return;
    const headers = [
      "id",
      "name",
      "slug",
      "planName",
      "status",
      "seats",
      "adminEmail",
      "createdAt",
      "monthlyRevenue",
    ];
    const csv = [headers.join(",")]
      .concat(
        rows.map((r) =>
          headers.map((h) => JSON.stringify((r as any)[h] ?? "")).join(","),
        ),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

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
                    <h2 className="text-lg font-semibold">Tenant Registry</h2>
                    <p className="text-sm text-muted-foreground">
                      Tenant provisioning and registry.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {loading && (
                      <div className="text-sm text-muted-foreground">
                        Loading…
                      </div>
                    )}
                    {error && (
                      <div className="text-sm text-destructive">{error}</div>
                    )}
                    <Button size="sm" variant="default">
                      New Tenant
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportCsv(filtered)}
                    >
                      Export CSV
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search tenants, slug or admin email..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={status} onValueChange={(v) => setStatus(v)}>
                      <SelectTrigger size="sm">
                        <SelectValue>
                          {status === "all" ? "All statuses" : status}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={plan} onValueChange={(v) => setPlan(v)}>
                      <SelectTrigger size="sm">
                        <SelectValue>
                          {plan === "all" ? "All plans" : plan}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All plans</SelectItem>
                        {plans.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border bg-card p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{t.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {t.slug}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{t.planName || "Unassigned"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                t.status === "Active"
                                  ? "default"
                                  : t.status === "Trial"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {t.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{t.seats}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {t.adminEmail}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(t.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="ghost">
                                Impersonate
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  t.status === "Active"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {t.status === "Active" ? "Suspend" : "Activate"}
                              </Button>
                            </div>
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
