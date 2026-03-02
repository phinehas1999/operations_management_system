"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Role } from "@/db/schema";

type UserStatus = "Active" | "Suspended" | "Inactive";

export type TenantUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  status: UserStatus;
  team: string | null;
  createdAt: string;
};

export function UsersRolesTable({ users }: { users: TenantUserRow[] }) {
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState<"all" | Role>("all");
  const [status, setStatus] = React.useState<"all" | UserStatus>("all");

  const roles = React.useMemo(
    () => Array.from(new Set(users.map((u) => u.role))).sort(),
    [users],
  );
  const statuses = React.useMemo(
    () => Array.from(new Set(users.map((u) => u.status))).sort(),
    [users],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (status !== "all" && u.status !== status) return false;
      if (!q) return true;
      return (
        (u.name || "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.team || "").toLowerCase().includes(q)
      );
    });
  }, [query, role, status, users]);

  return (
    <>
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <input
            className="w-full rounded-md border border-input px-3 py-2"
            placeholder="Search name, email or team..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={role}
            onValueChange={(v) => setRole(v as Role | "all")}
          >
            <SelectTrigger size="sm">
              <SelectValue>{role === "all" ? "All roles" : role}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(v) => setStatus(v as UserStatus | "all")}
          >
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
        </div>
      </div>

      <div className="rounded-md border bg-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="sr-only">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name || "—"}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={u.status === "Active" ? "default" : "secondary"}
                  >
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell>{u.team || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.email}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost">
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
