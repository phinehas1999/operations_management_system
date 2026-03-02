"use client";

import * as React from "react";
import TeamMembersMenu from "./team-members-menu";
import EditTeamModal from "./edit-team-modal";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function TeamRowActions({ teamId }: { teamId: string }) {
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    if (!confirm("Delete this team? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: teamId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to delete team");
      }
      toast.success("Team deleted");
      // refresh the page
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <EditTeamModal
        teamId={teamId}
        trigger={
          <Button size="sm" variant="ghost" aria-label="Edit team">
            <Edit2 className="h-4 w-4" />
          </Button>
        }
      />
      <TeamMembersMenu teamId={teamId} />
      <Button
        size="sm"
        variant="ghost"
        aria-label="Delete team"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
