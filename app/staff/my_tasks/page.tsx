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

import { useSession } from "next-auth/react";
// import tasks from "./mockMyTasks";

type TaskRow = {
  id: string;
  title: string;
  priority: string;
  status: string;
  createdBy?: string | null;
  assignedBy?: string;
  dueAt?: string | null;
};
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [priority, setPriority] = React.useState("all");
  const { data: session } = useSession();
  const [tasks, setTasks] = React.useState<TaskRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const statuses = React.useMemo(
    () => Array.from(new Set(tasks.map((t) => t.status))).sort(),
    [tasks],
  );
  const priorities = React.useMemo(
    () => Array.from(new Set(tasks.map((t) => t.priority))).sort(),
    [tasks],
  );

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/tasks?assigneeId=${encodeURIComponent(
            session.user.id,
          )}&assigneeType=USER`,
        );
        if (!mounted) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body?.error || "Failed to load tasks");
          setTasks([]);
          return;
        }
        const json = await res.json();
        const rows = Array.isArray(json?.tasks) ? json.tasks : [];

        // fetch tenant users to map createdBy -> name
        const uRes = await fetch(`/api/admin/users`);
        const uJson = uRes.ok ? await uRes.json().catch(() => ({})) : {};
        const users = Array.isArray(uJson?.users) ? uJson.users : [];
        const userMap: Record<string, any> = {};
        users.forEach((u: any) => (userMap[String(u.id)] = u));

        const out: TaskRow[] = rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          priority: r.priority,
          status: r.status,
          createdBy: r.createdBy || null,
          assignedBy: r.createdBy
            ? userMap[String(r.createdBy)]?.name || "—"
            : "—",
          dueAt: r.dueAt || null,
        }));

        if (!mounted) return;
        setTasks(out);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || String(err));
        setTasks([]);
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
    return tasks.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (!q) return true;
      return String(t.title || "")
        .toLowerCase()
        .includes(q);
    });
  }, [query, status, priority, tasks]);

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
                    <h2 className="text-lg font-semibold">My Tasks</h2>
                    <p className="text-sm text-muted-foreground">
                      Track your assigned tasks and status.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="default">
                      Update Status
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search my tasks..."
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

                    <Select
                      value={priority}
                      onValueChange={(v) => setPriority(v)}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue>
                          {priority === "all" ? "All priorities" : priority}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All priorities</SelectItem>
                        {priorities.map((p) => (
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
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned By</TableHead>
                        <TableHead>Due</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">
                            {t.title}
                          </TableCell>
                          <TableCell>{t.priority}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                t.status?.toLowerCase() === "completed"
                                  ? "default"
                                  : t.status?.toLowerCase() === "review"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {t.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{t.assignedBy || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {t.dueAt
                              ? new Date(t.dueAt).toLocaleDateString()
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
