import { NextResponse } from "next/server";

import { loadWalletDashboardData } from "@/lib/wallet-data";

export async function GET() {
  const data = await loadWalletDashboardData();

  return NextResponse.json(data, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
