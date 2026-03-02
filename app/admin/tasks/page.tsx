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
import { Loader2 } from "lucide-react";

import TaskFormModal from "./task-form-modal";
import TaskRowActions from "./task-row-actions";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

type TaskRow = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assigneeType: "UNASSIGNED" | "USER" | "TEAM";
  assigneeUserId?: string | null;
  assigneeTeamId?: string | null;
  assigneeName?: string | null;
  dueAt?: string | null;
  createdAt?: string | null;
};

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [priority, setPriority] = React.useState("all");
  const [assignee, setAssignee] = React.useState("all");
  const [tasks, setTasks] = React.useState<TaskRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const loadTasks = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const statuses = React.useMemo(
    () => Array.from(new Set(tasks.map((t) => t.status))).filter(Boolean),
    [tasks],
  );

  const priorities = React.useMemo(
    () => Array.from(new Set(tasks.map((t) => t.priority))).filter(Boolean),
    [tasks],
  );

  const assigneeOptions = React.useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [];
    tasks.forEach((t) => {
      if (t.assigneeType === "UNASSIGNED") {
        if (!seen.has("unassigned")) {
          opts.push({ value: "unassigned", label: "Unassigned" });
          seen.add("unassigned");
        }
        return;
      }
      const key = `${t.assigneeType}:${t.assigneeType === "USER" ? t.assigneeUserId : t.assigneeTeamId}`;
      if (key && !seen.has(key)) {
        opts.push({ value: key, label: t.assigneeName || "(No name)" });
        seen.add(key);
      }
    });
    return opts;
  }, [tasks]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (assignee !== "all") {
        if (assignee === "unassigned" && t.assigneeType !== "UNASSIGNED")
          return false;
        if (assignee !== "unassigned") {
          const [type, id] = assignee.split(":");
          if (type === "USER" && t.assigneeUserId !== id) return false;
          if (type === "TEAM" && t.assigneeTeamId !== id) return false;
        }
      }
      if (!q) return true;
      const haystack = `${t.title} ${t.assigneeName || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [tasks, query, status, priority, assignee]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

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
                      Track and manage tenant tasks.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TaskFormModal
                      mode="create"
                      onSaved={loadTasks}
                      trigger={<Button size="sm">New Task</Button>}
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
                    <Select
                      value={assignee}
                      onValueChange={(v) => setAssignee(v)}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue>
                          {assignee === "all" ? "All assignees" : assignee}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All assignees</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {assigneeOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-sm text-muted-foreground"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              Loading tasks...
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {!loading && filtered.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-sm text-muted-foreground"
                          >
                            No tasks found.
                          </TableCell>
                        </TableRow>
                      )}
                      {!loading &&
                        filtered.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">
                              {t.title}
                            </TableCell>
                            <TableCell className="capitalize">
                              {t.priority}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  t.status === "completed"
                                    ? "default"
                                    : t.status === "review"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="capitalize"
                              >
                                {t.status.replace("-", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {t.assigneeType === "UNASSIGNED"
                                ? "Unassigned"
                                : t.assigneeName || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(t.dueAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <TaskRowActions task={t} onChanged={loadTasks} />
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
