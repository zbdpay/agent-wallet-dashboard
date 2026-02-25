"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compactId, formatSats, formatTimestamp } from "@/lib/format";
import type { PaymentHistoryRecord } from "@/lib/wallet-data";

type PaymentFilter = "all" | "send" | "receive";

interface PaymentsTableProps {
  payments: PaymentHistoryRecord[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [filter, setFilter] = useState<PaymentFilter>("all");

  const visibleRows = useMemo(
    () =>
      payments.filter((payment) => {
        if (filter === "all") {
          return true;
        }
        return payment.type === filter;
      }),
    [filter, payments],
  );

  return (
    <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-zinc-950">Payments Ledger</CardTitle>
          <CardDescription className="text-zinc-600">Read-only view from local `payments.json`</CardDescription>
        </div>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as PaymentFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="receive">Received</TabsTrigger>
            <TabsTrigger value="send">Sent</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="h-[420px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">When</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="pr-6 text-right">Payment ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.length > 0 ? (
                visibleRows.map((payment) => (
                  <TableRow key={`${payment.id}-${payment.timestamp}`}>
                    <TableCell className="pl-6 text-xs text-zinc-600">{formatTimestamp(payment.timestamp)}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatSats(payment.amount_sats)}</TableCell>
                    <TableCell className="text-right text-zinc-600 tabular-nums">
                      {typeof payment.fee_sats === "number" ? formatSats(payment.fee_sats) : "-"}
                    </TableCell>
                    <TableCell className="pr-6 text-right font-mono text-xs text-zinc-600">{compactId(payment.id)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-zinc-600">
                    No payment rows for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
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
