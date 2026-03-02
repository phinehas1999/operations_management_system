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

// Fetch assets from tenant-scoped API instead of mock data
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");

  const [selectedCategory, setSelectedCategory] = React.useState("__all");
  const [assets, setAssets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
  }, [query, assets, selectedCategory]);

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
                      View assigned equipment and supplies.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="default">
                      Request Asset
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search assets or category..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
