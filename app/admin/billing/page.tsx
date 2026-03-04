"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconLoader, IconUpload } from "@tabler/icons-react";

import sidebarData from "../constants/sidebardata";
import siteHeaderData from "../constants/siteheaderdata";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  planName?: string | null;
  amountCents: number;
  currency: string;
  status: "Paid" | "Due" | "Overdue";
  issuedAt?: string;
  dueAt?: string | null;
};

type ConfirmationRow = {
  id: string;
  invoiceId: string | null;
  amountCents: number;
  currency: string;
  paymentDate?: string;
  paymentMethod?: string;
  transactionReference?: string | null;
  proofFileUrl?: string | null;
  status: "Pending" | "Approved" | "Rejected";
};

function formatMoney(cents: number, currency = "USD") {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminBillingPage() {
  const router = useRouter();
  const [invoices, setInvoices] = React.useState<InvoiceRow[]>([]);
  const [confirmations, setConfirmations] = React.useState<ConfirmationRow[]>(
    [],
  );
  const [loadingInvoices, setLoadingInvoices] = React.useState(true);
  const [loadingConfirmations, setLoadingConfirmations] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<
    string | null
  >(null);
  const [paymentMethod, setPaymentMethod] = React.useState("Bank Transfer");
  const [paymentDate, setPaymentDate] = React.useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [transactionReference, setTransactionReference] = React.useState("");
  const [proofFileUrl, setProofFileUrl] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const loadInvoices = React.useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const res = await fetch("/api/admin/invoices");
      if (!res.ok) throw new Error("Failed to load invoices");
      const data = await res.json();
      setInvoices(data || []);
    } catch (err) {
      setError("Unable to load invoices");
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  const loadConfirmations = React.useCallback(async () => {
    setLoadingConfirmations(true);
    try {
      const res = await fetch("/api/superadmin/payment-confirmations");
      if (!res.ok) throw new Error("Failed to load confirmations");
      const data = await res.json();
      setConfirmations(data || []);
    } catch (err) {
      setError("Unable to load payment confirmations");
    } finally {
      setLoadingConfirmations(false);
    }
  }, []);

  React.useEffect(() => {
    loadInvoices();
    loadConfirmations();
  }, [loadInvoices, loadConfirmations]);

  const invoicesWithStatus = React.useMemo(() => {
    const latestByInvoice = new Map<string, ConfirmationRow>();
    confirmations.forEach((c) => {
      if (!c.invoiceId) return;
      const existing = latestByInvoice.get(c.invoiceId);
      if (
        !existing ||
        new Date(c.paymentDate || 0) > new Date(existing.paymentDate || 0)
      ) {
        latestByInvoice.set(c.invoiceId, c);
      }
    });

    return invoices.map((inv) => {
      const conf = latestByInvoice.get(inv.id);
      return {
        ...inv,
        confirmationStatus: conf?.status ?? "Pending",
      } as InvoiceRow & { confirmationStatus: ConfirmationRow["status"] };
    });
  }, [confirmations, invoices]);

  async function submitConfirmation() {
    if (!selectedInvoiceId) return;
    setSubmitting(true);
    setError(null);
    try {
      const invoice = invoices.find((i) => i.id === selectedInvoiceId);
      const res = await fetch("/api/superadmin/payment-confirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceId,
          amountCents: invoice?.amountCents,
          currency: invoice?.currency,
          paymentDate,
          paymentMethod,
          transactionReference: transactionReference || undefined,
          proofFileUrl: proofFileUrl || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Failed to submit confirmation");
      }
      setDialogOpen(false);
      setSelectedInvoiceId(null);
      setTransactionReference("");
      setProofFileUrl("");
      await Promise.all([loadConfirmations(), loadInvoices()]);
    } catch (err: any) {
      setError(err.message || "Failed to submit confirmation");
    } finally {
      setSubmitting(false);
    }
  }

  const unpaidInvoices = invoicesWithStatus.filter((i) => i.status !== "Paid");

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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-8 md:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
            <p className="text-muted-foreground">
              View invoices and submit payment confirmations.
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  All invoices for your account.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  loadInvoices();
                  loadConfirmations();
                }}
                title="Refresh"
              >
                <IconLoader className="h-4 w-4 animate-spin" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingInvoices ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center">
                        <Skeleton className="mx-auto h-8 w-[200px]" />
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoicesWithStatus.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>{inv.planName || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(inv.issuedAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              inv.status === "Paid"
                                ? "default"
                                : inv.status === "Due"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatMoney(inv.amountCents, inv.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Actions"
                              >
                                <IconDotsVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {inv.status !== "Paid" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedInvoiceId(inv.id);
                                    setDialogOpen(true);
                                  }}
                                >
                                  Submit Payment Confirmation
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Confirmations</CardTitle>
              <CardDescription>
                Track status of submitted confirmations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingConfirmations ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center">
                        <Skeleton className="mx-auto h-8 w-[200px]" />
                      </TableCell>
                    </TableRow>
                  ) : confirmations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No confirmations submitted yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    confirmations.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          {c.invoiceId ? c.invoiceId.slice(0, 8) : "—"}
                        </TableCell>
                        <TableCell>
                          {formatMoney(c.amountCents, c.currency)}
                        </TableCell>
                        <TableCell>{c.paymentMethod || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(c.paymentDate)}
                        </TableCell>
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Payment Confirmation</DialogTitle>
            <DialogDescription>
              Provide payment details for the selected invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-1">
              <Label>Invoice</Label>
              <Select
                value={selectedInvoiceId ?? ""}
                onValueChange={(v) => setSelectedInvoiceId(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {unpaidInvoices.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.invoiceNumber} •{" "}
                      {formatMoney(i.amountCents, i.currency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <Label>Payment Method</Label>
              <Input
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <Label>Transaction Reference (optional)</Label>
              <Input
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="Bank txn id or receipt number"
              />
            </div>

            <div className="grid gap-1">
              <Label>Proof URL (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={proofFileUrl}
                  onChange={(e) => setProofFileUrl(e.target.value)}
                  placeholder="Link to receipt or upload"
                />
                <Button type="button" variant="outline" disabled>
                  <IconUpload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                For now, paste a public link; upload can be wired later.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitConfirmation}
              disabled={
                submitting ||
                !selectedInvoiceId ||
                !paymentDate ||
                !paymentMethod
              }
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
