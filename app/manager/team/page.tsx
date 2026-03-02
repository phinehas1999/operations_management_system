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

import { useSession } from "next-auth/react";
import * as api from "next/navigation";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const { data: session } = useSession();
  const [query, setQuery] = React.useState("");
  const [members, setMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const res = await fetch("/api/admin/teams");
        if (!mounted) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body?.error || "Failed to load teams");
          setMembers([]);
          return;
        }
        const rows = await res.json();
        const myTeams = (Array.isArray(rows) ? rows : []).filter(
          (t: any) => String(t.managerId) === String(session.user.id),
        );

        // fetch members for each team and aggregate
        const membersById: Record<string, any> = {};
        await Promise.all(
          myTeams.map(async (t: any) => {
            try {
              const mRes = await fetch(`/api/admin/teams/${t.id}/members`);
              if (!mRes.ok) return;
              const mJson = await mRes.json();
              const ms = Array.isArray(mJson?.members) ? mJson.members : [];
              ms.forEach((m: any) => {
                const id = String(m.id);
                if (!membersById[id]) {
                  membersById[id] = {
                    id: m.id,
                    name: m.name,
                    email: m.email,
                    role: m.role,
                    teams: [t.name],
                    createdAt: m.createdAt,
                  };
                } else {
                  if (!membersById[id].teams.includes(t.name)) {
                    membersById[id].teams.push(t.name);
                  }
                }
              });
            } catch (e) {
              return;
            }
          }),
        );

        if (!mounted) return;
        setMembers(Object.values(membersById));
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || String(err));
        setMembers([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (!q) return true;
      return (
        String(m.name || "")
          .toLowerCase()
          .includes(q) ||
        String(m.email || "")
          .toLowerCase()
          .includes(q) ||
        (Array.isArray(m.teams) && m.teams.join(", ").toLowerCase().includes(q))
      );
    });
  }, [query, members]);

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
                    <h2 className="text-lg font-semibold">Team</h2>
                    <p className="text-sm text-muted-foreground">
                      Review team coverage and assignments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* New Assignment removed for managers */}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search teams or leads..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border bg-card p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Teams</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">
                            {m.name}
                          </TableCell>
                          <TableCell>{m.email || "—"}</TableCell>
                          <TableCell>{m.role || "—"}</TableCell>
                          <TableCell>
                            {Array.isArray(m.teams) && m.teams.length > 0
                              ? m.teams.join(", ")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleDateString()
                              : "—"}
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
