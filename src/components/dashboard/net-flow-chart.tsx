"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyNetPoint } from "@/lib/wallet-data";

const chartConfig = {
  net_sats: {
    label: "Net Sats",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface NetFlowChartProps {
  points: DailyNetPoint[];
}

export function NetFlowChart({ points }: NetFlowChartProps) {
  return (
    <Card className="border-zinc-300/60 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-950/80">
      <CardHeader>
        <CardTitle className="text-zinc-950 dark:text-zinc-100">14-Day Net Flow</CardTitle>
        <CardDescription className="text-zinc-600 dark:text-zinc-300">Daily inbound minus outbound sats</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart accessibilityLayer data={points} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={(value: string) => value.slice(5)}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="net_sats" radius={6} fill="var(--color-net_sats)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
