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

import plans from "./mockPlans";
import invoices from "./mockBilling";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [invoiceStatus, setInvoiceStatus] = React.useState("all");

  const planFiltered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return plans.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        p.features.join(" ").toLowerCase().includes(q)
      );
    });
  }, [query]);

  const invoiceFiltered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((i) => {
      if (invoiceStatus !== "all" && i.status !== invoiceStatus) return false;
      if (!q) return true;
      return (
        i.tenantName.toLowerCase().includes(q) ||
        i.invoiceNumber.toLowerCase().includes(q) ||
        (i.plan || "").toLowerCase().includes(q)
      );
    });
  }, [query, invoiceStatus]);

  function exportCsv(rows: any[], name = "export.csv") {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
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
                    <h2 className="text-lg font-semibold">Billing & Plans</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage platform plans and view tenant invoices.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="default">
                      New Plan
                    </Button>
                    <Button size="sm" variant="outline">
                      Create Invoice
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search plans or invoices..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={invoiceStatus}
                      onValueChange={(v) => setInvoiceStatus(v)}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue>
                          {invoiceStatus === "all"
                            ? "All invoices"
                            : invoiceStatus}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All invoices</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Due">Due</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportCsv(invoiceFiltered, "invoices.csv")}
                    >
                      Export Invoices
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-md border bg-card p-4">
                    <h3 className="mb-2 text-sm font-medium">Plans</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Monthly</TableHead>
                          <TableHead>Seats</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {planFiltered.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{p.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {p.features.join(" · ")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>${p.priceMonthly}</TableCell>
                            <TableCell>{p.seats}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" variant="ghost">
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="rounded-md border bg-card p-4">
                    <h3 className="mb-2 text-sm font-medium">Invoices</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Tenant</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceFiltered.map((i) => (
                          <TableRow key={i.id}>
                            <TableCell>{i.invoiceNumber}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {i.tenantName}
                            </TableCell>
                            <TableCell>{i.plan}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  i.status === "Paid"
                                    ? "default"
                                    : i.status === "Due"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {i.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              ${i.amount}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
