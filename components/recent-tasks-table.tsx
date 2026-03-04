"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatDate(value: unknown) {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

export function RecentTasksTable({ limit = 3 }: { limit?: number }) {
  const [tasks, setTasks] = React.useState<any[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/tasks");
        if (!res.ok) throw new Error("Failed to load tasks");
        const body = await res.json();
        const rows = Array.isArray(body?.tasks) ? body.tasks : [];
        // sort by createdAt desc and take limit
        rows.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        if (mounted) setTasks(rows.slice(0, limit));
      } catch (err) {
        if (mounted) setTasks([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [limit]);

  if (loading) {
    return (
      <div className="mx-4 lg:mx-6 py-4 text-sm text-muted-foreground">
        <div className="px-4 lg:px-6">Loading recent tasks…</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card mx-4 lg:mx-6 py-4 lg:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Recently added tasks</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tasks || []).slice(0, limit).map((t) => (
              <TableRow key={t.id}>
                <TableCell className="w-16">{t.id}</TableCell>
                <TableCell>{t.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="px-2">
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell>{t.assigneeName || "Unassigned"}</TableCell>
                <TableCell>{formatDate(t.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default RecentTasksTable;
