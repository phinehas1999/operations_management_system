"use client";

import * as React from "react";

// badge removed — status column removed
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import EditUserModal from "./edit-user-modal";
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

export type TenantUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  // team: string | null;
  createdAt: string;
};

export function UsersRolesTable({ users }: { users: TenantUserRow[] }) {
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState<"all" | Role>("all");

  const roles = React.useMemo(
    () => Array.from(new Set(users.map((u) => u.role))).sort(),
    [users],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (!q) return true;
      return (
        (u.name || "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
        // (u.team || "").toLowerCase().includes(q)
      );
    });
  }, [query, role, users]);

  const [editingUser, setEditingUser] = React.useState<TenantUserRow | null>(
    null,
  );

  async function handleDelete(id: string) {
    if (!confirm("Delete this user? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      // refresh by reloading the page data
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  }

  function handleEdit(id: string) {
    const u = users.find((x) => x.id === id) ?? null;
    setEditingUser(u);
  }

  return (
    <>
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <input
            className="w-full rounded-md border border-input px-3 py-2"
            placeholder="Search name or email..."
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
        </div>
      </div>

      <div className="rounded-md border bg-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
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
                <TableCell className="text-sm text-muted-foreground">
                  {u.email}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" aria-label="Actions">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => handleEdit(u.id)}>
                        <Edit2 className="size-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => handleDelete(u.id)}
                      >
                        <Trash2 className="size-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {editingUser && (
          <EditUserModal
            user={editingUser}
            open={true}
            onOpenChange={(v) => {
              if (!v) setEditingUser(null);
            }}
          />
        )}
      </div>
    </>
  );
}
