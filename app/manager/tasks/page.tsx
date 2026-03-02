"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
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
import TaskFormModal from "./task-form-modal";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// replaced mock data with real API-driven tasks
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [priority, setPriority] = React.useState("all");

  const { data: session } = useSession();

  const [tasks, setTasks] = React.useState<any[]>([]);
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

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (!q) return true;
      return (
        (t.title || "").toLowerCase().includes(q) ||
        (t.assigneeName || t.assignedTo || "").toLowerCase().includes(q)
      );
    });
  }, [query, status, priority, tasks]);

  const loadTasks = React.useCallback(async () => {
    setError(null);
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("assigneeId", session.user.id);
      params.set("assigneeType", "USER");
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);

      const res = await fetch(`/api/admin/tasks?${params.toString()}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error || "Failed to load tasks");
        setTasks([]);
        return;
      }
      const json = await res.json();
      const rows = Array.isArray(json?.tasks) ? json.tasks : [];
      const mapped = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        priority: r.priority,
        status: r.status,
        assignedTo: r.assigneeName || "",
        assigneeName: r.assigneeName || "",
        dueDate: r.dueAt ? new Date(r.dueAt).toLocaleDateString() : "-",
      }));
      setTasks(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status, priority]);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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
                    <h2 className="text-lg font-semibold">Tasks</h2>
                    <p className="text-sm text-muted-foreground">
                      Track team tasks and assignments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TaskFormModal
                      mode="create"
                      onSaved={loadTasks}
                      trigger={
                        <Button size="sm" variant="default">
                          New Task
                        </Button>
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search tasks or assignee..."
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
                        <TableHead>Assigned</TableHead>
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
                                t.status === "Completed"
                                  ? "default"
                                  : t.status === "Review"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {t.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{t.assignedTo}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {t.dueDate}
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
