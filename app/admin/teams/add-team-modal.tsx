"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

export default function AddTeamModal() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [users, setUsers] = React.useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  const [managerId, setManagerId] = React.useState<string | null>(null);
  const [memberIds, setMemberIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          managerId,
          memberIds,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to create team");
      setOpen(false);
      setName("");
      setDescription("");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create team");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!open) return;
    // fetch tenant users for selects
    (async () => {
      try {
        const r = await fetch("/api/admin/users");
        if (!r.ok) return;
        const j = await r.json();
        setUsers(j.users || []);
      } catch (e) {
        // ignore
      }
    })();
  }, [open]);

  const [memberQuery, setMemberQuery] = React.useState("");
  const filteredUsers = React.useMemo(
    () =>
      users.filter((u) =>
        (u.name || u.id).toLowerCase().includes(memberQuery.toLowerCase()),
      ),
    [users, memberQuery],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New Team</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Team</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label>Manager</Label>
            <Select
              value={managerId ?? "__none"}
              onValueChange={(v) => setManagerId(v === "__none" ? null : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="(None)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">(None)</SelectItem>
                {users
                  .filter((u) => u.role === "MANAGER" || u.role === "ADMIN")
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Members</Label>
            <Input
              placeholder="Search members..."
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
            />
            <div className="mt-2 max-h-40 overflow-auto rounded-md border bg-card p-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-2 px-2 py-1"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={memberIds.includes(u.id)}
                      onCheckedChange={(c) => {
                        const checked = Boolean(c);
                        setMemberIds((prev) => {
                          if (checked)
                            return Array.from(new Set([...prev, u.id]));
                          return prev.filter((id) => id !== u.id);
                        });
                      }}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{u.name || u.id}</div>
                      <div className="text-muted-foreground text-xs">
                        {u.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
