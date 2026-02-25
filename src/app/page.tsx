import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { loadWalletDashboardData } from "@/lib/wallet-data";

export default async function Home() {
  const data = await loadWalletDashboardData();

  return <DashboardShell initialData={data} />;
}
