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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  IconDotsVertical,
  IconTrash,
  IconEdit,
  IconUserOff,
} from "@tabler/icons-react";

// Fetch tenants from backend API instead of local mock data
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [plan, setPlan] = React.useState("all");
  const [sortKey, setSortKey] = React.useState<"name" | "seats">("name");

  const [tenants, setTenants] = React.useState<Array<any>>([]);
  const [planOptions, setPlanOptions] = React.useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // form fields for modal
  const [nameField, setNameField] = React.useState("");
  const [slugField, setSlugField] = React.useState("");
  const [slugEditable, setSlugEditable] = React.useState(false);
  const [planField, setPlanField] = React.useState("");
  const [seatsField, setSeatsField] = React.useState<number>(1);
  const [adminEmailField, setAdminEmailField] = React.useState("");
  const [monthlyRevenueField, setMonthlyRevenueField] =
    React.useState<number>(0);

  const plans = React.useMemo(() => {
    return Array.from(
      new Set(tenants.map((t) => t.planName || "Unassigned")),
    ).sort();
  }, [tenants]);

  const statuses = React.useMemo(() => {
    return Array.from(new Set(tenants.map((t) => t.status))).sort();
  }, [tenants]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = tenants.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (plan !== "all" && (t.planName || "Unassigned") !== plan) return false;
      if (!q) return true;
      return (
        (t.name || "").toLowerCase().includes(q) ||
        (t.slug || "").toLowerCase().includes(q) ||
        (t.adminEmail || "").toLowerCase().includes(q)
      );
    });

    if (sortKey === "name") {
      out = out.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortKey === "seats") {
      out = out.sort((a, b) => (a.seats || 0) - (b.seats || 0));
    }

    return out;
  }, [tenants, query, status, plan, sortKey]);

  React.useEffect(() => {
    if (!planField && planOptions.length) {
      setPlanField(planOptions[0].id);
    }
  }, [planOptions, planField]);

  React.useEffect(() => {
    let mounted = true;
    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [tenantsRes, plansRes] = await Promise.all([
          fetch("/api/superadmin/tenants", { signal: ctrl.signal }),
          fetch("/api/superadmin/plans", { signal: ctrl.signal }),
        ]);
        if (!tenantsRes.ok) throw new Error("Failed to fetch tenants");
        if (!plansRes.ok) throw new Error("Failed to fetch plans");
        const [tenantData, planData] = await Promise.all([
          tenantsRes.json(),
          plansRes.json(),
        ]);
        if (!mounted) return;
        setTenants(Array.isArray(tenantData) ? tenantData : []);
        setPlanOptions(Array.isArray(planData) ? planData : []);
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

  function exportCsv(rows: Array<any>) {
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
    a.download = "tenants.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const formatDate = (ts: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const formatCurrency = (v: any) => {
    if (v == null || v === "") return "";
    if (typeof v === "number") {
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(v);
      } catch {
        return String(v);
      }
    }
    return String(v);
  };

  async function toggleTenantStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    setProcessingId(id);
    setError(null);
    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update tenant");
      setTenants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Update failed");
    } finally {
      setProcessingId(null);
    }
  }

  function handleEditTenant(t: any) {
    setEditingId(t.id);
    setNameField(t.name || "");
    setSlugField(t.slug || "");
    setSlugEditable(false);
    setPlanField(t.planId || "");
    setSeatsField(Number(t.seats || 1));
    setAdminEmailField(t.adminEmail || "");
    setMonthlyRevenueField(Number(t.monthlyRevenue || 0));
    setEditOpen(true);
  }

  async function handleDeleteTenant(id: string) {
    if (!window.confirm("Delete tenant? This cannot be undone.")) return;
    setProcessingId(id);
    setError(null);
    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Delete failed");
      setTenants((p) => p.filter((x) => x.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Delete failed");
    } finally {
      setProcessingId(null);
    }
  }

  const selectedPlanLabel =
    planOptions.find((p) => p.id === planField)?.name || "Select plan";

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
                    <h2 className="text-lg font-semibold">Tenants</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage tenants, billing and provisioning.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="default">
                          New Tenant
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create tenant</DialogTitle>
                          <DialogDescription>
                            Provide tenant details to create a new account.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 md:gap-6">
                          <div className="md:col-span-2">
                            <Label>Company name</Label>
                            <Input
                              value={nameField}
                              onChange={(e) => {
                                const v = e.target.value;
                                setNameField(v);
                                // auto-generate slug only when not manually edited
                                if (!slugEditable) {
                                  const slugDefault = v
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/(^-|-$)/g, "");
                                  setSlugField(slugDefault);
                                }
                              }}
                              placeholder="Acme Corp"
                            />
                          </div>

                          <div>
                            <Label>Slug</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={slugField}
                                onChange={(e) => setSlugField(e.target.value)}
                                readOnly={!slugEditable}
                                className={slugEditable ? "" : "opacity-80"}
                                placeholder="acme-corp"
                              />
                              <Button
                                size="sm"
                                variant={
                                  slugEditable ? "destructive" : "outline"
                                }
                                onClick={() => setSlugEditable((s) => !s)}
                              >
                                {slugEditable ? "Lock" : "Edit"}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Auto-generated from name; click Edit to change.
                            </p>
                          </div>

                          <div>
                            <Label>Plan</Label>
                            <Select
                              value={planField}
                              onValueChange={(v) => setPlanField(v)}
                            >
                              <SelectTrigger size="sm">
                                <SelectValue>{selectedPlanLabel}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {planOptions.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Seats</Label>
                            <Input
                              type="number"
                              value={String(seatsField)}
                              onChange={(e) =>
                                setSeatsField(Number(e.target.value || 0))
                              }
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Admin email</Label>
                            <Input
                              value={adminEmailField}
                              onChange={(e) =>
                                setAdminEmailField(e.target.value)
                              }
                              placeholder="admin@company.com"
                            />
                          </div>

                          <div>
                            <Label>Monthly revenue</Label>
                            <Input
                              type="number"
                              value={String(monthlyRevenueField)}
                              onChange={(e) =>
                                setMonthlyRevenueField(
                                  Number(e.target.value || 0),
                                )
                              }
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCreateOpen(false)}
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (creating) return;
                              setCreating(true);
                              setError(null);
                              try {
                                const res = await fetch(
                                  "/api/superadmin/tenants",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      name: nameField,
                                      slug: slugField,
                                      planId: planField || null,
                                      seats: Number(seatsField || 1),
                                      adminEmail: adminEmailField || null,
                                      monthlyRevenue: Number(
                                        monthlyRevenueField || 0,
                                      ),
                                    }),
                                  },
                                );
                                const body = await res.json();
                                if (!res.ok)
                                  throw new Error(
                                    body?.error || "Create failed",
                                  );
                                const tenant = body?.tenant;
                                if (tenant) setTenants((p) => [tenant, ...p]);
                                setCreateOpen(false);
                                // reset fields
                                setNameField("");
                                setSlugField("");
                                setPlanField("");
                                setSeatsField(1);
                                setAdminEmailField("");
                                setMonthlyRevenueField(0);
                              } catch (err: any) {
                                console.error(err);
                                setError(err?.message ?? "Create failed");
                              } finally {
                                setCreating(false);
                              }
                            }}
                          >
                            {creating ? "Creating..." : "Create"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit tenant</DialogTitle>
                          <DialogDescription>
                            Update tenant details and save.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 md:gap-6">
                          <div className="md:col-span-2">
                            <Label>Company name</Label>
                            <Input
                              value={nameField}
                              onChange={(e) => setNameField(e.target.value)}
                            />
                          </div>

                          <div>
                            <Label>Slug</Label>
                            <Input
                              value={slugField}
                              onChange={(e) => setSlugField(e.target.value)}
                            />
                          </div>

                          <div>
                            <Label>Plan</Label>
                            <Select
                              value={planField}
                              onValueChange={(v) => setPlanField(v)}
                            >
                              <SelectTrigger size="sm">
                                <SelectValue>{selectedPlanLabel}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {planOptions.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Seats</Label>
                            <Input
                              type="number"
                              value={String(seatsField)}
                              onChange={(e) =>
                                setSeatsField(Number(e.target.value || 0))
                              }
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Admin email</Label>
                            <Input
                              value={adminEmailField}
                              onChange={(e) =>
                                setAdminEmailField(e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label>Monthly revenue</Label>
                            <Input
                              type="number"
                              value={String(monthlyRevenueField)}
                              onChange={(e) =>
                                setMonthlyRevenueField(
                                  Number(e.target.value || 0),
                                )
                              }
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditOpen(false)}
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (!editingId) return;
                              setCreating(true);
                              setError(null);
                              try {
                                const res = await fetch(
                                  "/api/superadmin/tenants",
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      id: editingId,
                                      name: nameField,
                                      slug: slugField,
                                      planId: planField || null,
                                      seats: Number(seatsField || 1),
                                      adminEmail: adminEmailField || null,
                                      monthlyRevenue: Number(
                                        monthlyRevenueField || 0,
                                      ),
                                    }),
                                  },
                                );
                                const body = await res.json();
                                if (!res.ok)
                                  throw new Error(
                                    body?.error || "Update failed",
                                  );
                                const updated = body?.updated;
                                if (updated)
                                  setTenants((p) =>
                                    p.map((x) =>
                                      x.id === updated.id ? updated : x,
                                    ),
                                  );
                                setEditOpen(false);
                              } catch (err: any) {
                                console.error(err);
                                setError(err?.message ?? "Update failed");
                              } finally {
                                setCreating(false);
                              }
                            }}
                          >
                            Save
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
                  {loading && (
                    <div className="text-sm text-muted-foreground ml-4">
                      Loading...
                    </div>
                  )}
                  {error && (
                    <div className="text-sm text-destructive ml-4">{error}</div>
                  )}
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

                    <Select
                      value={sortKey}
                      onValueChange={(v) => setSortKey(v as any)}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue>
                          {sortKey === "name" ? "Sort: Name" : "Sort: Seats"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Sort: Name</SelectItem>
                        <SelectItem value="seats">Sort: Seats</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Revenue</TableHead>
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
                          {formatCurrency(t.monthlyRevenue)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(t.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                >
                                  <IconDotsVertical />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onSelect={() =>
                                    toggleTenantStatus(t.id, t.status)
                                  }
                                >
                                  {t.status === "Active"
                                    ? "Suspend"
                                    : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => handleEditTenant(t)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => handleDeleteTenant(t.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </SidebarInset>
    </SidebarProvider>
  );
}
