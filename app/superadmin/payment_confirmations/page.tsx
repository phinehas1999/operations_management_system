"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDotsVertical,
  IconCheck,
  IconX,
  IconExternalLink,
  IconLoader,
} from "@tabler/icons-react";
import { toast } from "sonner";
import sidebarData from "@/app/superadmin/constants/sidebardata";
import siteHeaderData from "@/app/superadmin/constants/siteheaderdata";

export default function PaymentConfirmationsPage() {
  const [confirmations, setConfirmations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Review Dialog State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedConfirmation, setSelectedConfirmation] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">(
    "approve",
  );

  const fetchConfirmations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/superadmin/payment-confirmations");
      if (!res.ok) throw new Error("Failed to fetch confirmations");
      const data = await res.json();
      setConfirmations(data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load payment confirmations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfirmations();
  }, []);

  const handleReview = (confirmation: any, action: "approve" | "reject") => {
    setSelectedConfirmation(confirmation);
    setReviewAction(action);
    setAdminNote(""); // clear note
    setReviewOpen(true);
  };

  const submitReview = async () => {
    if (!selectedConfirmation) return;

    try {
      setProcessingId(selectedConfirmation.id);
      const res = await fetch("/api/superadmin/payment-confirmations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedConfirmation.id,
          status: reviewAction === "approve" ? "Approved" : "Rejected",
          adminNote: adminNote,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(
        `Payment confirmation ${reviewAction === "approve" ? "approved" : "rejected"}`,
      );
      setReviewOpen(false);
      fetchConfirmations(); // refresh list
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredConfirmations = confirmations.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.tenant?.name?.toLowerCase().includes(q) ||
      c.invoiceId?.toLowerCase().includes(q) ||
      c.amountCents?.toString().includes(q);
    return matchesSearch;
  });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem", // "calc(var(--spacing) * 72)"
          "--header-height": "3.5rem", // "calc(var(--spacing) * 14)"
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" sidedebardata={sidebarData} />
      <SidebarInset>
        <SiteHeader siteheaderdata={siteHeaderData} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-8 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Payment Confirmations
              </h2>
              <p className="text-muted-foreground">
                Review and manage payment confirmations from tenants.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <Input
              placeholder="Search by tenant, invoice ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <IconLoader className="animate-spin h-6 w-6 mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredConfirmations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No payment confirmations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConfirmations.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        {new Date(
                          c.createdAt || c.paymentDate,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {c.tenant?.name || "Unknown Tenant"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>Invoice: {c.invoiceId?.slice(0, 8)}...</span>
                          {c.invoice && (
                            <span className="text-xs text-muted-foreground">
                              (Due:{" "}
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: c.currency || "USD",
                              }).format((c.invoice.amountCents || 0) / 100)}
                              )
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: c.currency || "USD",
                        }).format(c.amountCents / 100)}
                      </TableCell>
                      <TableCell>{c.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === "Approved"
                              ? "default"
                              : c.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <IconDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {c.proofFileUrl && (
                              <DropdownMenuItem>
                                <a
                                  href={c.proofFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center w-full"
                                >
                                  <IconExternalLink className="mr-2 h-4 w-4" />
                                  View Proof
                                </a>
                              </DropdownMenuItem>
                            )}
                            {/* Show Approve unless already approved; show Reject unless already rejected */}
                            {c.status !== "Approved" && (
                              <DropdownMenuItem
                                onClick={() => handleReview(c, "approve")}
                              >
                                <IconCheck className="mr-2 h-4 w-4 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {c.status !== "Rejected" && (
                              <DropdownMenuItem
                                onClick={() => handleReview(c, "reject")}
                              >
                                <IconX className="mr-2 h-4 w-4 text-red-600" />
                                Reject
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve"
                ? "Approve Payment"
                : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "This will mark the invoice as paid."
                : "Please provide a reason for rejection."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Input
                id="note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="col-span-3"
                placeholder={
                  reviewAction === "reject"
                    ? "Reason for rejection..."
                    : "Optional note..."
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              variant={reviewAction === "reject" ? "destructive" : "default"}
              disabled={reviewAction === "reject" && !adminNote.trim()}
            >
              Confirm {reviewAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
