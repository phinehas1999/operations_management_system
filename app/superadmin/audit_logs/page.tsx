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

import logs from "./mockLogs";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [severity, setSeverity] = React.useState("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      if (severity !== "all" && l.severity !== severity) return false;
      if (!q) return true;
      return (
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    });
  }, [query, severity]);

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  function exportCsv(rows: any[]) {
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
    a.download = "audit-logs.csv";
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Audit & Logs</h2>
                    <p className="text-sm text-muted-foreground">
                      View platform audit trail and system logs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportCsv(filtered)}
                    >
                      Export Logs
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search user, action, resource or details..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={severity}
                      onValueChange={(v) => setSeverity(v)}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue>
                          {severity === "all" ? "All severities" : severity}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All severities</SelectItem>
                        <SelectItem value="Info">Info</SelectItem>
                        <SelectItem value="Warning">Warning</SelectItem>
                        <SelectItem value="Error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border bg-card p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(l.timestamp)}
                          </TableCell>
                          <TableCell>{l.user}</TableCell>
                          <TableCell>{l.action}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {l.resource}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                l.severity === "Info"
                                  ? "default"
                                  : l.severity === "Warning"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {l.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {l.details}
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
