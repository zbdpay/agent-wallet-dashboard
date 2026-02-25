"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { NetFlowChart } from "@/components/dashboard/net-flow-chart";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WalletOverview } from "@/components/dashboard/wallet-overview";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { WalletDashboardData } from "@/lib/wallet-data";

interface DashboardShellProps {
  initialData: WalletDashboardData;
}

const REFRESH_INTERVAL_MS = 15_000;

export function DashboardShell({ initialData }: DashboardShellProps) {
  const [data, setData] = useState<WalletDashboardData>(initialData);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Refresh failed (${response.status})`);
      }

      const payload = (await response.json()) as WalletDashboardData;
      setData(payload);
      setLastUpdatedAt(new Date());
      setRefreshError(null);
    } catch (error) {
      if (error instanceof Error) {
        setRefreshError(error.message);
      } else {
        setRefreshError("Refresh failed");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLastUpdatedAt(new Date());

    const timer = setInterval(() => {
      void refreshDashboard();
    }, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [refreshDashboard]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdatedAt) {
      return "Sync pending";
    }

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }).format(lastUpdatedAt);
  }, [lastUpdatedAt]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f6f4ef_0%,_#ece8dd_35%,_#d5d1c5_100%)] px-4 py-8 text-zinc-900 dark:bg-[radial-gradient(circle_at_top,_#12152a_0%,_#0b1022_40%,_#060911_100%)] dark:text-zinc-100 sm:px-6 lg:px-12">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-zinc-300/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-700/70 dark:bg-zinc-950/75 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">agent-wallet</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Wallet & Payments Dashboard</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
                Local-first visualization for your agent host machine. It reads wallet metadata and payment history directly
                from your JSON files while optionally fetching live balance through your existing API key.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                  Auto-refresh 15s
                </Badge>
                <ThemeToggle />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void refreshDashboard();
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh now
                </Button>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">Last sync: {lastUpdatedLabel}</p>
              {refreshError ? <p className="text-xs text-rose-700 dark:text-rose-300">Refresh error: {refreshError}</p> : null}
            </div>
          </div>
        </section>

        <SummaryCards
          liveBalanceSats={data.wallet.liveBalanceSats}
          totalReceivedSats={data.summary.totalReceivedSats}
          totalSentSats={data.summary.totalSentSats}
          netFlowSats={data.summary.netFlowSats}
        />

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <NetFlowChart points={data.trends.last14DaysNet} />
          <WalletOverview
            lightningAddress={data.wallet.lightningAddress}
            hasApiKey={data.wallet.hasApiKey}
            configPath={data.paths.configPath}
            paymentsPath={data.paths.paymentsPath}
            configError={data.fileErrors.config}
            paymentsError={data.fileErrors.payments}
            balanceError={data.wallet.balanceError}
            totalPayments={data.summary.totalCount}
            completedCount={data.summary.completedCount}
            pendingCount={data.summary.pendingCount}
            failedCount={data.summary.failedCount}
          />
        </section>

        <Separator className="bg-zinc-400/50 dark:bg-zinc-700/60" />

        <PaymentsTable payments={data.payments} />
      </main>
    </div>
  );
}
