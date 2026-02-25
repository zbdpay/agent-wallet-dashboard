"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileJson } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { compactId, formatSats, formatTimestamp } from "@/lib/format";
import type { PaymentHistoryRecord } from "@/lib/wallet-data";

interface PaymentDetailsDialogProps {
  payment: PaymentHistoryRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsDialog({ payment, open, onOpenChange }: PaymentDetailsDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const prettyJson = useMemo(() => {
    if (!payment) {
      return "";
    }

    return `${JSON.stringify(payment, null, 2)}\n`;
  }, [payment]);

  const copyText = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 1400);
    } catch {
      setCopiedField(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-950">
            Transaction {payment ? compactId(payment.id) : "details"}
          </DialogTitle>
          <DialogDescription className="text-zinc-600">
            Scrollable record details with one-click copy actions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {payment ? (
            <div className="grid gap-3 pb-4">
              <FieldRow label="Payment ID" value={payment.id} copied={copiedField === "id"} onCopy={() => copyText(payment.id, "id")} />
              <FieldRow label="Type" value={payment.type} copied={copiedField === "type"} onCopy={() => copyText(payment.type, "type")} />
              <FieldRow label="Status" value={payment.status} copied={copiedField === "status"} onCopy={() => copyText(payment.status, "status")} />
              <FieldRow
                label="Timestamp"
                value={payment.timestamp}
                helper={formatTimestamp(payment.timestamp)}
                copied={copiedField === "timestamp"}
                onCopy={() => copyText(payment.timestamp, "timestamp")}
              />
              <FieldRow
                label="Amount (sats)"
                value={String(payment.amount_sats)}
                helper={formatSats(payment.amount_sats)}
                copied={copiedField === "amount"}
                onCopy={() => copyText(String(payment.amount_sats), "amount")}
              />
              <FieldRow
                label="Fee (sats)"
                value={typeof payment.fee_sats === "number" ? String(payment.fee_sats) : ""}
                helper={typeof payment.fee_sats === "number" ? formatSats(payment.fee_sats) : "No fee"}
                copied={copiedField === "fee"}
                onCopy={() => copyText(typeof payment.fee_sats === "number" ? String(payment.fee_sats) : "", "fee")}
                disabled={typeof payment.fee_sats !== "number"}
              />
              <FieldRow
                label="Preimage"
                value={payment.preimage ?? ""}
                helper={payment.preimage ? undefined : "No preimage recorded"}
                copied={copiedField === "preimage"}
                onCopy={() => copyText(payment.preimage ?? "", "preimage")}
                disabled={!payment.preimage}
              />

              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    payment.type === "receive"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-amber-300 bg-amber-50 text-amber-800"
                  }
                >
                  {payment.type}
                </Badge>
                <StatusBadge status={payment.status} />
              </div>

              <Separator className="my-1 bg-zinc-300/80" />

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-800">Raw JSON</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void copyText(prettyJson, "json");
                    }}
                    className="gap-2"
                  >
                    {copiedField === "json" ? <Check className="h-4 w-4" /> : <FileJson className="h-4 w-4" />}
                    {copiedField === "json" ? "Copied" : "Copy JSON"}
                  </Button>
                </div>
                <pre className="overflow-x-auto rounded-md border border-zinc-300/70 bg-zinc-50 p-3 font-mono text-xs text-zinc-700">
                  {prettyJson}
                </pre>
              </div>
            </div>
          ) : null}
        </ScrollArea>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  helper?: string;
  copied: boolean;
  disabled?: boolean;
  onCopy: () => void;
}

function FieldRow({ label, value, helper, copied, disabled = false, onCopy }: FieldRowProps) {
  return (
    <div className="rounded-md border border-zinc-300/70 bg-zinc-50 px-3 py-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onCopy} disabled={disabled} className="h-7 gap-1 px-2">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="break-all font-mono text-xs text-zinc-800">{value || "-"}</p>
      {helper ? <p className="mt-1 text-xs text-zinc-600">{helper}</p> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const className = normalized.includes("fail") || normalized.includes("error") || normalized.includes("cancel")
    ? "border-rose-300 bg-rose-50 text-rose-800"
    : normalized.includes("complete") || normalized.includes("paid") || normalized.includes("settled")
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : "border-zinc-300 bg-zinc-100 text-zinc-700";

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}
