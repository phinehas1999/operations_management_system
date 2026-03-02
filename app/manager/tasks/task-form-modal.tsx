"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

const STATUS_OPTIONS = ["pending", "in-progress", "review", "completed"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];

type AssigneeType = "UNASSIGNED" | "USER";

type TaskFormValue = {
  id?: string;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueAt?: string | null;
  assigneeType?: AssigneeType;
  assigneeUserId?: string | null;
};

type OptionUser = {
  id: string;
  name: string | null;
  email: string | null;
  role?: string | null;
};

type Props = {
  mode: "create" | "edit";
  trigger: React.ReactNode;
  task?: TaskFormValue & { assigneeName?: string | null };
  onSaved?: () => void;
};

export default function TaskFormModal({ mode, trigger, task, onSaved }: Props) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<string>("pending");
  const [priority, setPriority] = React.useState<string>("medium");
  const [assigneeType, setAssigneeType] =
    React.useState<AssigneeType>("UNASSIGNED");
  const [assigneeUserId, setAssigneeUserId] = React.useState<string | null>(
    null,
  );
  const [dueDate, setDueDate] = React.useState<string>("");

  const [users, setUsers] = React.useState<OptionUser[]>([]);
  const [loadingOptions, setLoadingOptions] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setStatus(task?.status || "pending");
    setPriority(task?.priority || "medium");
    const type = (task?.assigneeType as AssigneeType) || "UNASSIGNED";
    setAssigneeType(type);
    setAssigneeUserId(type === "USER" ? task?.assigneeUserId || null : null);
    const d = task?.dueAt ? new Date(task.dueAt) : null;
    setDueDate(d ? d.toISOString().slice(0, 10) : "");
  }, [task]);

  React.useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  const loadOptions = React.useCallback(async () => {
    setLoadingOptions(true);
    try {
      const res = await fetch("/api/admin/tasks/options");
      if (!res.ok) throw new Error("Failed to load options");
      const data = await res.json();
      // only include staff members for manager assignment
      const staff = Array.isArray(data.users)
        ? data.users.filter(
            (u: any) => (u.role || "").toUpperCase() === "STAFF",
          )
        : [];
      setUsers(staff || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load options");
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) loadOptions();
  }, [open, loadOptions]);

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title,
        description,
        status,
        priority,
        assigneeType,
      };
      if (dueDate)
        payload.dueAt = new Date(`${dueDate}T00:00:00Z`).toISOString();
      if (assigneeType === "USER" && assigneeUserId) {
        payload.assigneeType = "USER";
        payload.assigneeId = assigneeUserId;
      } else {
        payload.assigneeType = "UNASSIGNED";
      }

      const url =
        mode === "create" ? "/api/admin/tasks" : `/api/admin/tasks/${task?.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to save task");
      }
      toast.success(mode === "create" ? "Task created" : "Task updated");
      setOpen(false);
      onSaved?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New Task" : "Edit Task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a task for your team."
              : "Update task details."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              rows={3}
              placeholder="Details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Assignee</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={assigneeType}
                onValueChange={(v: AssigneeType) => setAssigneeType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                  <SelectItem value="USER">Staff member</SelectItem>
                </SelectContent>
              </Select>
              {assigneeType === "USER" && (
                <Select
                  value={assigneeUserId ?? "__none"}
                  onValueChange={(v) =>
                    setAssigneeUserId(v === "__none" ? null : v)
                  }
                  disabled={loadingOptions}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">(None)</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.email || u.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
