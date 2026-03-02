"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import TaskFormModal from "./task-form-modal";

type TaskItem = {
  id: string;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueAt?: string | null;
  assigneeType?: "UNASSIGNED" | "USER" | "TEAM";
  assigneeUserId?: string | null;
  assigneeTeamId?: string | null;
  assigneeName?: string | null;
};

type Props = {
  task: TaskItem;
  onChanged?: () => void;
};

export default function TaskRowActions({ task, onChanged }: Props) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to delete task");
      }
      toast.success("Task deleted");
      onChanged?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <TaskFormModal
        mode="edit"
        task={task}
        onSaved={onChanged}
        trigger={
          <Button size="sm" variant="ghost" aria-label="Edit task">
            <Edit2 className="h-4 w-4" />
          </Button>
        }
      />
      <Button
        size="sm"
        variant="ghost"
        aria-label="Delete task"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
