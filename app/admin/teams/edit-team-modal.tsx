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

export default function EditTeamModal({
  teamId,
  trigger,
}: {
  teamId: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [users, setUsers] = React.useState<any[]>([]);
  const [managerId, setManagerId] = React.useState<string | null>(null);
  const [memberIds, setMemberIds] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const [uRes, tRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch(`/api/admin/teams/${teamId}`),
        ]);
        if (uRes.ok) {
          const uj = await uRes.json();
          setUsers(uj.users || []);
        }
        if (tRes.ok) {
          const tj = await tRes.json();
          const team = tj.team;
          setName(team.name || "");
          setDescription(team.description || "");
          setManagerId(team.managerId || null);
          setMemberIds((tj.members || []).map((m: any) => m.id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, teamId]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      ((u.name || u.email || u.id) + "").toLowerCase().includes(q),
    );
  }, [users, query]);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: teamId,
          name,
          description,
          managerId,
          memberIds,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Failed to update team");
      }
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to update team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm">Edit</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
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
                      {u.name || u.email || u.id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Members</Label>
            <Input
              placeholder="Search members..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-2 max-h-40 overflow-auto rounded-md border bg-card p-2">
              {filtered.map((u) => (
                <div key={u.id} className="flex items-center gap-2 px-2 py-1">
                  <Checkbox
                    checked={memberIds.includes(u.id)}
                    onCheckedChange={(c) => {
                      const checked = Boolean(c);
                      setMemberIds((prev) =>
                        checked
                          ? Array.from(new Set([...prev, u.id]))
                          : prev.filter((id) => id !== u.id),
                      );
                    }}
                  />
                  <div className="text-sm">
                    <div className="font-medium">
                      {u.name || u.email || u.id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {u.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
