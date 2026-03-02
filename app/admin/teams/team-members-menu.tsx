"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical } from "lucide-react";

export default function TeamMembersMenu({ teamId }: { teamId: string }) {
  const [open, setOpen] = React.useState(false);
  const [members, setMembers] = React.useState<
    Array<{ id: string; name: string | null; role?: string }>
  >([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/admin/teams/${teamId}/members`);
        if (!res.ok) return;
        const j = await res.json();
        setMembers(j.members || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, teamId]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      ((m.name || m.id) + (m.role || "")).toLowerCase().includes(q),
    );
  }, [members, query]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Team actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2">
        <div className="px-2 pb-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={loading ? "Loading..." : "Search members..."}
          />
        </div>
        <div className="max-h-40 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No members
            </div>
          ) : (
            filtered.map((m) => (
              <div key={m.id} className="flex items-center gap-2 px-3 py-2">
                <Checkbox checked={true} onCheckedChange={() => {}} />
                <div className="text-sm">
                  <div className="font-medium">{m.name || m.id}</div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
