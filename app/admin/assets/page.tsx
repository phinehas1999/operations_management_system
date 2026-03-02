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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Fetch assets from the tenant-scoped API instead of using mock data
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("__all");
  const [assets, setAssets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    category: "",
    quantity: 0,
    minimumThreshold: 0,
    teamId: "",
    status: "Active",
  });
  const [teams, setTeams] = React.useState<any[]>([]);
  const [teamQuery, setTeamQuery] = React.useState("");
  const [selectedTeamName, setSelectedTeamName] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/admin/assets")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        setAssets(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function fetchTeams() {
    try {
      const r = await fetch("/api/admin/teams");
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch teams", err);
      setTeams([]);
    }
  }

  React.useEffect(() => {
    if (dialogOpen) fetchTeams();
  }, [dialogOpen]);

  async function fetchAssets() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/assets");
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      setAssets(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  // keep assets in sync after actions
  React.useEffect(() => {
    // initial fetch done above; ensure handler exists for refetching if needed
  }, []);

  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        name: form.name,
        category: form.category || null,
        quantity: Number(form.quantity) || 0,
        minimumThreshold: Number(form.minimumThreshold) || 0,
        teamId: form.teamId || null,
        status: form.status || "Active",
      };

      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(String(res.status));
      const created = await res.json();
      // refresh list
      await fetchAssets();
      setDialogOpen(false);
      setForm({
        name: "",
        category: "",
        quantity: 0,
        minimumThreshold: 0,
        teamId: "",
        status: "Active",
      });
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (selectedCategory && selectedCategory !== "__all") {
        const cat = String(a.category || "");
        if (cat !== selectedCategory) return false;
      }
      if (!q) return true;
      return (
        String(a.name || "")
          .toLowerCase()
          .includes(q) ||
        String(a.category || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [query, assets]);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    for (const a of assets) {
      if (a.category) set.add(String(a.category));
    }
    return Array.from(set).sort((x, y) => x.localeCompare(y));
  }, [assets]);

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
                    <h2 className="text-lg font-semibold">Assets</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage inventory and asset status.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setDialogOpen(true)}
                    >
                      Add Asset
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <div className="flex-1">
                      <input
                        className="w-full rounded-md border border-input px-3 py-2"
                        placeholder="Search assets or category..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="w-44">
                      <Select
                        value={selectedCategory}
                        onValueChange={(v) => setSelectedCategory(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">All categories</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                          {categories.length === 0 && (
                            <div className="px-2 py-2 text-sm text-muted-foreground">
                              No categories
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border bg-card p-4">
                  {loading && <div className="py-2">Loading assets…</div>}
                  {error && (
                    <div className="text-destructive text-sm py-2">
                      Error loading assets: {error}
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Minimum</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((a) => {
                        const qty = Number(a.quantity || 0);
                        const min = Number(
                          a.minimumThreshold ?? a.minimum_threshold ?? 0,
                        );
                        // Prefer persisted status (Active/Inactive). Fall back to quantity-based if absent.
                        const persistedStatus = String(
                          a.status ?? a.status ?? "",
                        );
                        const status =
                          persistedStatus || (qty <= 0 ? "Inactive" : "Active");

                        const badgeVariant =
                          status === "Inactive" ? "destructive" : "default";

                        return (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">
                              {a.name}
                            </TableCell>
                            <TableCell>{a.category}</TableCell>
                            <TableCell>{qty}</TableCell>
                            <TableCell>{min}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {a.teamId ?? a.team_id ?? "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={badgeVariant}>{status}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {a.createdAt ?? a.created_at}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {/* Add Asset Dialog */}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Asset</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                          Create a new asset for this tenant.
                        </p>
                      </DialogHeader>
                      <form onSubmit={handleCreate} className="space-y-3">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={form.name}
                            onChange={(e) =>
                              setForm((s) => ({ ...s, name: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Input
                            value={form.category}
                            onChange={(e) =>
                              setForm((s) => ({
                                ...s,
                                category: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={String(form.quantity)}
                              onChange={(e) =>
                                setForm((s) => ({
                                  ...s,
                                  quantity: Number(e.target.value),
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Minimum Threshold</Label>
                            <Input
                              type="number"
                              value={String(form.minimumThreshold)}
                              onChange={(e) =>
                                setForm((s) => ({
                                  ...s,
                                  minimumThreshold: Number(e.target.value),
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Team (optional)</Label>
                          <Select
                            value={form.teamId ?? "__none"}
                            onValueChange={(v) =>
                              setForm((s) => ({
                                ...s,
                                teamId: v === "__none" ? "" : v,
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="(None)" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 pb-2">
                                <Input
                                  placeholder="Search teams..."
                                  value={teamQuery}
                                  onChange={(e) => setTeamQuery(e.target.value)}
                                />
                              </div>
                              <SelectItem value="__none">(None)</SelectItem>
                              {(teams || [])
                                .filter((t) => {
                                  if (!teamQuery) return true;
                                  return String(t.name || "")
                                    .toLowerCase()
                                    .includes(teamQuery.toLowerCase());
                                })
                                .map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    <div className="text-sm font-medium">
                                      {t.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {t.description}
                                    </div>
                                  </SelectItem>
                                ))}
                              {teams.length === 0 && (
                                <div className="px-2 py-2 text-sm text-muted-foreground">
                                  No teams
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <select
                            className="w-full rounded-md border border-input px-3 py-2"
                            value={form.status}
                            onChange={(e) =>
                              setForm((s) => ({ ...s, status: e.target.value }))
                            }
                          >
                            <option>Active</option>
                            <option>Inactive</option>
                          </select>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={submitting}>
                            {submitting ? "Adding…" : "Add Asset"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
