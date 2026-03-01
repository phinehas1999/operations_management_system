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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Download,
  CreditCard,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  MoreHorizontal,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

type PlanRow = {
  id: string;
  name: string;
  slug: string;
  priceMonthlyCents: number;
  priceYearlyCents: number;
  seats: number | null;
  features: string[];
  createdAt?: string;
};

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName?: string | null;
  planId?: string | null;
  planName?: string | null;
  amountCents: number;
  currency: string;
  status: "Paid" | "Due" | "Overdue";
  issuedAt?: string;
  dueAt?: string | null;
};

function formatMoney(cents: number, currency = "USD") {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [invoiceStatus, setInvoiceStatus] = React.useState("all");
  const [plans, setPlans] = React.useState<PlanRow[]>([]);
  const [invoices, setInvoices] = React.useState<InvoiceRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingInvoiceId, setUpdatingInvoiceId] = React.useState<
    string | null
  >(null);
  const [invoicePage, setInvoicePage] = React.useState(1);
  const INVOICE_PAGE_SIZE = 10;

  async function updateInvoiceStatus(
    id: string,
    status: "Paid" | "Due" | "Overdue",
  ) {
    try {
      const res = await fetch("/api/superadmin/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update");

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
      );
    } catch (err) {
      console.error("Update invoice status failed", err);
      setError("Unable to update invoice status");
      setTimeout(() => setError(null), 4000);
    }
  }

  async function updateInvoicePlan(id: string, planId: string | null) {
    setUpdatingInvoiceId(id);
    try {
      const plan = plans.find((p) => p.id === planId) ?? null;
      const planName = plan ? plan.name : null;

      // If a plan was selected, use its monthly price as the invoice amount
      const newAmountCents = plan ? plan.priceMonthlyCents : undefined;

      const payload: any = { id, planId: planId || null, planName };
      if (typeof newAmountCents === "number")
        payload.amountCents = newAmountCents;

      const res = await fetch("/api/superadmin/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update plan");

      const updated = json?.invoice || json;

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? {
                ...inv,
                planId: planId || null,
                planName,
                amountCents:
                  updated?.amountCents ?? newAmountCents ?? inv.amountCents,
              }
            : inv,
        ),
      );
    } catch (err) {
      console.error("Update invoice plan failed", err);
      setError("Unable to update invoice plan");
      setTimeout(() => setError(null), 4000);
    } finally {
      setUpdatingInvoiceId(null);
    }
  }

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [plansRes, invoicesRes] = await Promise.all([
          fetch("/api/superadmin/plans"),
          fetch("/api/superadmin/invoices"),
        ]);

        if (!plansRes.ok || !invoicesRes.ok) {
          throw new Error("Billing API returned an error");
        }

        const [plansJson, invoicesJson] = await Promise.all([
          plansRes.json(),
          invoicesRes.json(),
        ]);

        if (mounted) {
          setPlans(plansJson || []);
          setInvoices(invoicesJson || []);
        }
      } catch (err) {
        console.error("Load billing data failed", err);
        if (mounted) setError("Unable to load billing data. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

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
  }, [plans, query]);

  const invoiceFiltered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((i) => {
      if (invoiceStatus !== "all" && i.status !== invoiceStatus) return false;
      if (!q) return true;
      return (
        (i.tenantName || "").toLowerCase().includes(q) ||
        i.invoiceNumber.toLowerCase().includes(q) ||
        (i.planName || "").toLowerCase().includes(q)
      );
    });
  }, [invoices, invoiceStatus, query]);

  // Reset to first page when filters or query change
  React.useEffect(() => {
    setInvoicePage(1);
  }, [invoiceStatus, query]);

  // newest-first order for invoices
  const invoiceSorted = React.useMemo(() => {
    return [...invoiceFiltered].sort((a, b) => {
      const ta = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
      const tb = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return b.invoiceNumber.localeCompare(a.invoiceNumber);
    });
  }, [invoiceFiltered]);

  const invoiceTotal = invoiceSorted.length;
  const invoiceTotalPages = Math.max(
    1,
    Math.ceil(invoiceTotal / INVOICE_PAGE_SIZE),
  );
  const invoicePageItems = React.useMemo(() => {
    const start = (invoicePage - 1) * INVOICE_PAGE_SIZE;
    return invoiceSorted.slice(start, start + INVOICE_PAGE_SIZE);
  }, [invoiceSorted, invoicePage]);

  const totals = React.useMemo(() => {
    const totalCents = invoiceFiltered.reduce(
      (sum, i) => sum + Number(i.amountCents || 0),
      0,
    );
    const paidCents = invoiceFiltered
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + Number(i.amountCents || 0), 0);
    const outstandingCents = invoiceFiltered
      .filter((i) => i.status !== "Paid")
      .reduce((sum, i) => sum + Number(i.amountCents || 0), 0);

    return {
      count: invoiceFiltered.length,
      paidCents,
      outstandingCents,
      avgCents: invoiceFiltered.length
        ? Math.round(totalCents / invoiceFiltered.length)
        : 0,
    };
  }, [invoiceFiltered]);

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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-8 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Billing & Plans
              </h2>
              <p className="text-muted-foreground">
                Manage subscription plans and track invoicing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
              <Button size="sm" variant="default">
                <FileText className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatMoney(totals.paidCents + totals.outstandingCents)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Across {totals.count} invoices
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatMoney(totals.paidCents)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  collected from completed payments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatMoney(totals.outstandingCents)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Due or overdue payments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Plans
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">{plans.length}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  Available subscription tiers
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="md:flex md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-1 items-center space-x-2 md:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans, invoices, tenants..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={invoiceStatus}
                onValueChange={(v) => setInvoiceStatus(v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Due">Due</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => exportCsv(invoiceFiltered, "invoices.csv")}
                title="Export Invoices"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  A list of recent billing activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Invoice #</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoicePageItems.map((i) => (
                        <TableRow key={i.id}>
                          <TableCell className="font-medium">
                            {i.invoiceNumber}
                          </TableCell>
                          <TableCell className="font-medium">
                            {i.tenantName}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={i.planId ?? ""}
                              onValueChange={(v) =>
                                updateInvoicePlan(i.id, v || null)
                              }
                              disabled={updatingInvoiceId === i.id}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="—" />
                              </SelectTrigger>
                              <SelectContent>
                                {plans.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                i.status === "Paid"
                                  ? "default"
                                  : i.status === "Due"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={
                                i.status === "Paid"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 border-none"
                                  : ""
                              }
                            >
                              {i.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(i.issuedAt)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatMoney(i.amountCents, i.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateInvoiceStatus(i.id, "Paid")
                                  }
                                >
                                  Mark Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateInvoiceStatus(i.id, "Due")
                                  }
                                >
                                  Mark Due
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateInvoiceStatus(i.id, "Overdue")
                                  }
                                >
                                  Mark Overdue
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!invoiceSorted.length && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No invoices found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    {Math.min(
                      (invoicePage - 1) * INVOICE_PAGE_SIZE + 1,
                      invoiceTotal,
                    )}{" "}
                    - {Math.min(invoicePage * INVOICE_PAGE_SIZE, invoiceTotal)}{" "}
                    of {invoiceTotal}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={invoicePage <= 1}
                      onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Page {invoicePage} / {invoiceTotalPages}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={invoicePage >= invoiceTotalPages}
                      onClick={() =>
                        setInvoicePage((p) =>
                          Math.min(invoiceTotalPages, p + 1),
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plans</CardTitle>
                <CardDescription>
                  Manage your subscription tiers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead>Monthly Price</TableHead>
                        <TableHead>Yearly Price</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planFiltered.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            {p.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.features.join(" · ")}
                          </TableCell>
                          <TableCell>
                            {formatMoney(p.priceMonthlyCents)}
                          </TableCell>
                          <TableCell>
                            {formatMoney(p.priceYearlyCents)}
                          </TableCell>
                          <TableCell>
                            {p.seats === null ? "Unlimited" : p.seats}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!planFiltered.length && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No plans found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
