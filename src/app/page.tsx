import { Separator } from "@/components/ui/separator";
import { NetFlowChart } from "@/components/dashboard/net-flow-chart";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WalletOverview } from "@/components/dashboard/wallet-overview";
import { loadWalletDashboardData } from "@/lib/wallet-data";

export default async function Home() {
  const data = await loadWalletDashboardData();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f6f4ef_0%,_#ece8dd_35%,_#d5d1c5_100%)] px-4 py-8 text-zinc-900 sm:px-6 lg:px-12">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-zinc-300/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">agent-wallet</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Wallet & Payments Dashboard</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Local-first visualization for your agent host machine. It reads wallet metadata and payment history directly
            from your JSON files while optionally fetching live balance through your existing API key.
          </p>
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

        <Separator className="bg-zinc-400/50" />

        <PaymentsTable payments={data.payments} />
      </main>
    </div>
  );
}
