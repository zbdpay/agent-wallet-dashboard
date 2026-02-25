import { ArrowDownCircle, ArrowUpCircle, Coins, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSats, formatSignedSats } from "@/lib/format";

interface SummaryCardsProps {
  liveBalanceSats: number | null;
  totalReceivedSats: number;
  totalSentSats: number;
  netFlowSats: number;
}

export function SummaryCards({
  liveBalanceSats,
  totalReceivedSats,
  totalSentSats,
  netFlowSats,
}: SummaryCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader className="pb-2">
          <CardDescription className="text-zinc-600">Live Wallet Balance</CardDescription>
          <CardTitle className="text-2xl tracking-tight text-zinc-950">
            {liveBalanceSats === null ? "Unavailable" : formatSats(liveBalanceSats)}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-zinc-600">
          <Coins className="h-4 w-4" />
          From local API key and `/v0/wallet`
        </CardContent>
      </Card>

      <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader className="pb-2">
          <CardDescription className="text-zinc-600">Total Received</CardDescription>
          <CardTitle className="text-2xl tracking-tight text-zinc-950">{formatSats(totalReceivedSats)}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-zinc-600">
          <ArrowDownCircle className="h-4 w-4 text-emerald-600" />
          Inbound settlements in local history
        </CardContent>
      </Card>

      <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader className="pb-2">
          <CardDescription className="text-zinc-600">Total Sent</CardDescription>
          <CardTitle className="text-2xl tracking-tight text-zinc-950">{formatSats(totalSentSats)}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-zinc-600">
          <ArrowUpCircle className="h-4 w-4 text-amber-600" />
          Outbound payments from local history
        </CardContent>
      </Card>

      <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader className="pb-2">
          <CardDescription className="text-zinc-600">Net Flow</CardDescription>
          <CardTitle className="text-2xl tracking-tight text-zinc-950">{formatSignedSats(netFlowSats)}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-zinc-600">
          <TrendingUp className="h-4 w-4" />
          Received minus sent and fees
        </CardContent>
      </Card>
    </section>
  );
}
