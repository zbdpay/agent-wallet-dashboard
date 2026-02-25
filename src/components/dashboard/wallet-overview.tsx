import { AlertTriangle, Database, FolderOpen, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WalletOverviewProps {
  lightningAddress: string | null;
  hasApiKey: boolean;
  configPath: string;
  paymentsPath: string;
  configError: string | null;
  paymentsError: string | null;
  balanceError: string | null;
  totalPayments: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
}

export function WalletOverview({
  lightningAddress,
  hasApiKey,
  configPath,
  paymentsPath,
  configError,
  paymentsError,
  balanceError,
  totalPayments,
  completedCount,
  pendingCount,
  failedCount,
}: WalletOverviewProps) {
  return (
    <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-950/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-950 dark:text-zinc-100">
          <Wallet className="h-5 w-5" />
          Wallet Context
        </CardTitle>
        <CardDescription className="text-zinc-600 dark:text-zinc-300">Source files and current wallet identity</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="grid gap-2 rounded-lg border border-zinc-300/70 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-300">Lightning Address</span>
            <Badge variant="outline">{lightningAddress ? "Configured" : "Missing"}</Badge>
          </div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{lightningAddress ?? "Not found in local config"}</p>
        </div>

        <div className="grid gap-2 rounded-lg border border-zinc-300/70 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-300">API Key</span>
            <Badge variant="outline">{hasApiKey ? "Present" : "Missing"}</Badge>
          </div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{hasApiKey ? "Loaded from local config (masked)" : "Not available for live balance call"}</p>
        </div>

        <div className="grid gap-2 rounded-lg border border-zinc-300/70 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200">
          <p className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="font-semibold">config.json:</span> {configPath}
          </p>
          <p className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="font-semibold">payments.json:</span> {paymentsPath}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{totalPayments} total</Badge>
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">{completedCount} completed</Badge>
          <Badge className="bg-zinc-700 text-white hover:bg-zinc-700 dark:bg-zinc-600 dark:hover:bg-zinc-600">{pendingCount} pending</Badge>
          <Badge className="bg-rose-600 text-white hover:bg-rose-600">{failedCount} failed</Badge>
        </div>

        {(configError || paymentsError || balanceError) && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700/70 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="mb-1 flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Read diagnostics
            </p>
            <ul className="grid gap-1 text-xs">
              {configError && <li>config.json: {configError}</li>}
              {paymentsError && <li>payments.json: {paymentsError}</li>}
              {balanceError && <li>balance: {balanceError}</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
