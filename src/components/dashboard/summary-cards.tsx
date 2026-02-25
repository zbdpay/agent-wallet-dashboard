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
      <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <CardHeader className="pb-2">
          <CardDescription className="text-zinc-600 dark:text-zinc-300">Live Wallet Balance</CardDescription>
          <CardTitle className="text-2xl tracking-tight text-zinc-950 dark:text-zinc-100">
            {liveBalanceSats === null ? "Unavailable" : formatSats(liveBalanceSats)}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <Coins className="h-4 w-4" />
          From local API key and `/v0/wallet`
        </CardContent>
      </Card>

      <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <CardHeader className="pb-2">
          <CardDescription className="text-zinc-600 dark:text-zinc-300">Total Received</CardDescription>
          <CardTitle className="text-2xl tracking-tight text-zinc-950 dark:text-zinc-100">{formatSats(totalReceivedSats)}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <ArrowDownCircle className="h-4 w-4 text-emerald-600" />
          Inbound settlements in local history
        </CardContent>
      </Card>

      <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <CardHeader className="pb-2">
          <CardDescription className="text-zinc-600 dark:text-zinc-300">Total Sent</CardDescription>
          <CardTitle className="text-2xl tracking-tight text-zinc-950 dark:text-zinc-100">{formatSats(totalSentSats)}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <ArrowUpCircle className="h-4 w-4 text-amber-600" />
          Outbound payments from local history
        </CardContent>
      </Card>

      <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <CardHeader className="pb-2">
          <CardDescription className="text-zinc-600 dark:text-zinc-300">Net Flow</CardDescription>
          <CardTitle className="text-2xl tracking-tight text-zinc-950 dark:text-zinc-100">{formatSignedSats(netFlowSats)}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <TrendingUp className="h-4 w-4" />
          Received minus sent and fees
        </CardContent>
      </Card>
    </section>
  );
}
