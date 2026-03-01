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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [createTenantId, setCreateTenantId] = React.useState<string | null>(
    null,
  );
  const [createPlanId, setCreatePlanId] = React.useState<string | null>(null);
  const [createAmount, setCreateAmount] = React.useState<number | "">("");
  const [createCurrency, setCreateCurrency] = React.useState("USD");
  const [createStatus, setCreateStatus] = React.useState<
    "Paid" | "Due" | "Overdue"
  >("Due");
  const [createIssuedAt, setCreateIssuedAt] = React.useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [createDueAt, setCreateDueAt] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  // Create Plan dialog state
  const [planOpen, setPlanOpen] = React.useState(false);
  const [planCreating, setPlanCreating] = React.useState(false);
  const [planEditingId, setPlanEditingId] = React.useState<string | null>(null);
  const [planName, setPlanName] = React.useState("");
  const [planSlug, setPlanSlug] = React.useState("");
  const [planMonthly, setPlanMonthly] = React.useState<number | "">("");
  const [planYearly, setPlanYearly] = React.useState<number | "">("");
  const [planSeats, setPlanSeats] = React.useState<number | "">("");
  const [planFeatures, setPlanFeatures] = React.useState("");
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

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice? This action cannot be undone.")) return;
    setUpdatingInvoiceId(id);
    try {
      const res = await fetch("/api/superadmin/invoices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete");

      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      console.error("Delete invoice failed", err);
      setError((err as any)?.message || "Unable to delete invoice");
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPlanOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => setCreateOpen(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>
                  Create a new invoice for an existing tenant.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setCreating(true);
                  try {
                    if (!createTenantId) {
                      setError(
                        "Please select a tenant before creating an invoice.",
                      );
                      setTimeout(() => setError(null), 4000);
                      setCreating(false);
                      return;
                    }

                    // generate a simple invoice number if backend requires one
                    const invoiceNumber = `INV-${new Date()
                      .toISOString()
                      .replace(/[^0-9]/g, "")
                      .slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;

                    const payload: any = {
                      tenantId: createTenantId,
                      invoiceNumber,
                      planId: createPlanId,
                      amountCents:
                        typeof createAmount === "number"
                          ? createAmount
                          : undefined,
                      currency: createCurrency,
                      status: createStatus,
                      issuedAt: createIssuedAt,
                      dueAt: createDueAt || null,
                    };

                    const res = await fetch("/api/superadmin/invoices", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.error || "Failed");

                    const created = json?.invoice || json;
                    setInvoices((prev) => [created, ...prev]);
                    setCreateOpen(false);
                    // reset
                    setCreateTenantId(null);
                    setCreatePlanId(null);
                    setCreateAmount("");
                    setCreateCurrency("USD");
                    setCreateStatus("Due");
                  } catch (err) {
                    console.error("Create invoice failed", err);
                    setError(
                      (err as any)?.message || "Unable to create invoice",
                    );
                    setTimeout(() => setError(null), 4000);
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tenant</label>
                  <Select
                    value={createTenantId ?? ""}
                    onValueChange={(v) => setCreateTenantId(v || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        new Map(
                          invoices
                            .filter((x) => x.tenantId)
                            .map((x) => [
                              x.tenantId,
                              x.tenantName || x.tenantId,
                            ]),
                        ),
                      ).map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <label className="text-sm font-medium">Plan</label>
                  <Select
                    value={createPlanId ?? ""}
                    onValueChange={(v) => {
                      setCreatePlanId(v || null);
                      const plan = plans.find((p) => p.id === v) ?? null;
                      if (plan) setCreateAmount(plan.priceMonthlyCents);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <label className="text-sm font-medium">Amount (USD)</label>
                  <Input
                    type="number"
                    value={createAmount === "" ? "" : String(createAmount)}
                    onChange={(e) => setCreateAmount(Number(e.target.value))}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Issued</label>
                      <Input
                        type="date"
                        value={createIssuedAt}
                        onChange={(e) => setCreateIssuedAt(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Due</label>
                      <Input
                        type="date"
                        value={createDueAt}
                        onChange={(e) => setCreateDueAt(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={createStatus}
                      onValueChange={(v) => setCreateStatus(v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Due">Due</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateOpen(false)}
                        disabled={creating}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creating}>
                        {creating ? "Creating..." : "Create Invoice"}
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={planOpen} onOpenChange={setPlanOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New Plan</DialogTitle>
                <DialogDescription>
                  Create a subscription plan (monthly/yearly pricing, seats,
                  features).
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPlanCreating(true);
                  try {
                    if (!planName.trim()) {
                      setError("Plan name is required");
                      setTimeout(() => setError(null), 3000);
                      setPlanCreating(false);
                      return;
                    }

                    const payload: any = {
                      name: planName.trim(),
                      slug:
                        planSlug.trim() ||
                        planName
                          .trim()
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, ""),
                      priceMonthlyCents:
                        planMonthly === ""
                          ? 0
                          : Math.round(Number(planMonthly) * 100),
                      priceYearlyCents:
                        planYearly === ""
                          ? 0
                          : Math.round(Number(planYearly) * 100),
                      seats: planSeats === "" ? null : Number(planSeats),
                      features: planFeatures
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    };

                    const res = await fetch("/api/superadmin/plans", {
                      method: planEditingId ? "PATCH" : "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(
                        planEditingId
                          ? { id: planEditingId, ...payload }
                          : payload,
                      ),
                    });

                    // Try to parse JSON, but fall back to text if parsing fails
                    let json: any = null;
                    try {
                      json = await res.json();
                    } catch (parseErr) {
                      const text = await res.text();
                      json = { error: text };
                    }

                    if (!res.ok) {
                      const serverMsg =
                        json?.error || json?.message || "Failed to create plan";
                      console.error("Create plan failed (server):", serverMsg);
                      setError(String(serverMsg));
                      setTimeout(() => setError(null), 5000);
                      setPlanCreating(false);
                      return;
                    }

                    const createdOrUpdated = json?.plan || json;
                    if (planEditingId) {
                      setPlans((prev) =>
                        prev.map((pl) =>
                          pl.id === planEditingId ? createdOrUpdated : pl,
                        ),
                      );
                    } else {
                      setPlans((prev) => [createdOrUpdated, ...prev]);
                    }
                    setPlanOpen(false);
                    // reset
                    setPlanEditingId(null);
                    setPlanName("");
                    setPlanSlug("");
                    setPlanMonthly("");
                    setPlanYearly("");
                    setPlanSeats("");
                    setPlanFeatures("");
                  } catch (err) {
                    console.error("Create plan failed", err);
                    setError((err as any)?.message || "Unable to create plan");
                    setTimeout(() => setError(null), 4000);
                  } finally {
                    setPlanCreating(false);
                  }
                }}
              >
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />

                  <label className="text-sm font-medium">Slug (optional)</label>
                  <Input
                    value={planSlug}
                    onChange={(e) => setPlanSlug(e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Monthly ($)</label>
                      <Input
                        type="number"
                        value={planMonthly === "" ? "" : String(planMonthly)}
                        onChange={(e) =>
                          setPlanMonthly(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Yearly ($)</label>
                      <Input
                        type="number"
                        value={planYearly === "" ? "" : String(planYearly)}
                        onChange={(e) =>
                          setPlanYearly(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>

                  <label className="text-sm font-medium">
                    Seats (leave empty for unlimited)
                  </label>
                  <Input
                    type="number"
                    value={planSeats === "" ? "" : String(planSeats)}
                    onChange={(e) =>
                      setPlanSeats(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />

                  <label className="text-sm font-medium">
                    Features (comma separated)
                  </label>
                  <Input
                    value={planFeatures}
                    onChange={(e) => setPlanFeatures(e.target.value)}
                  />

                  <DialogFooter>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPlanOpen(false)}
                        disabled={planCreating}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={planCreating}>
                        {planCreating ? "Creating..." : "Create Plan"}
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              </form>
            </DialogContent>
          </Dialog>

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
                                <DropdownMenuItem
                                  onClick={() => deleteInvoice(i.id)}
                                >
                                  Delete
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Plan actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => {
                                    // populate form for editing
                                    setPlanEditingId(p.id);
                                    setPlanName(p.name || "");
                                    setPlanSlug(p.slug || "");
                                    setPlanMonthly(p.priceMonthlyCents ?? 0);
                                    setPlanYearly(p.priceYearlyCents ?? 0);
                                    setPlanSeats(p.seats ?? "");
                                    setPlanFeatures(
                                      (p.features || []).join(", "),
                                    );
                                    setPlanOpen(true);
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    if (!confirm(`Delete plan "${p.name}"?`))
                                      return;
                                    try {
                                      setPlanCreating(true);
                                      const res = await fetch(
                                        "/api/superadmin/plans",
                                        {
                                          method: "DELETE",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({ id: p.id }),
                                        },
                                      );
                                      const json = await res.json();
                                      if (!res.ok)
                                        throw new Error(
                                          json?.error ||
                                            "Failed to delete plan",
                                        );
                                      setPlans((prev) =>
                                        prev.filter((x) => x.id !== p.id),
                                      );
                                    } catch (err) {
                                      console.error("Delete plan failed", err);
                                      setError(
                                        (err as any)?.message ||
                                          "Unable to delete plan",
                                      );
                                      setTimeout(() => setError(null), 4000);
                                    } finally {
                                      setPlanCreating(false);
                                    }
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
