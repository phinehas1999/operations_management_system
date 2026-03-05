"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

type ChartPoint = { date: string; [key: string]: number | string | undefined };

const chartData: ChartPoint[] = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

import { Skeleton } from "@/components/ui/skeleton";

export function ChartAreaInteractive({
  data = chartData,
  config = chartConfig,
  loading = false,
}: {
  data?: ChartPoint[];
  config?: ChartConfig;
  loading?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  const referenceDate = React.useMemo(() => {
    const times = (data || [])
      .map((d) => new Date(d.date).getTime())
      .filter((t) => Number.isFinite(t));
    if (!times.length) return new Date();
    return new Date(Math.max(...times));
  }, [data]);

  // Tooltip that shows per-day values and range totals for each series
  function TooltipWithRangeTotals(props: any) {
    const { active, payload, label } = props as {
      active?: boolean;
      payload?: any[];
      label?: string;
    };

    if (!active || !payload || !payload.length) return null;

    // compute totals across the currently filtered data for each payload key
    const totals: Record<string, number> = {};
    for (const p of payload) {
      const key = p.dataKey || p.name;
      totals[key] = filteredData.reduce((acc, d) => {
        const v = Number((d as any)[key]);
        return acc + (Number.isFinite(v) ? v : 0);
      }, 0);
    }

    return (
      <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
        <div className="font-medium">
          {label &&
            new Date(label).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
        </div>
        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== "none")
            .map((item: any) => (
              <div
                key={item.dataKey}
                className="flex w-full items-center justify-between"
              >
                <div className="text-muted-foreground">
                  {item.name || item.dataKey}
                </div>
                <div className="text-foreground font-mono font-medium tabular-nums">
                  {Number(item.value).toLocaleString()}
                </div>
              </div>
            ))}

          <div className="border-t pt-2">
            {Object.keys(totals).map((k) => (
              <div
                key={k}
                className="flex w-full items-center justify-between text-sm"
              >
                <div className="text-muted-foreground">Range total</div>
                <div className="text-foreground font-mono font-medium tabular-nums">
                  {totals[k].toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-64 mb-2" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-40" />
          </CardDescription>
          <CardAction>
            <Skeleton className="h-8 w-40" />
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        {/* Title: when chart contains pending + review series show combined incomplete total */}
        {(() => {
          const hasPending = Object.prototype.hasOwnProperty.call(
            config,
            "pending",
          );
          const hasReview = Object.prototype.hasOwnProperty.call(
            config,
            "review",
          );

          if (hasPending && hasReview) {
            const total = filteredData.reduce((acc, d) => {
              return (
                acc +
                Number((d as any).pending || 0) +
                Number((d as any).review || 0)
              );
            }, 0);
            return (
              <CardTitle>
                Incomplete tasks (pending + under review){" "}
                {total.toLocaleString()}
              </CardTitle>
            );
          }

          // Fallback: show latest value from the first series, unless the series
          // should be aggregated across the range (e.g. `tasks` where we want a
          // total count). If the config entry sets `aggregate: 'sum'` we sum
          // across `filteredData`. Otherwise we pick the latest non-empty value.
          const seriesKeys = Object.keys(config).filter(
            (k) => k !== "visitors",
          );
          const firstKey = seriesKeys[0];
          let total = 0;
          const aggregateType = firstKey
            ? ((config as any)[firstKey]?.aggregate as string | undefined)
            : undefined;

          if (firstKey && filteredData.length) {
            if (aggregateType === "sum" || firstKey === "tasks") {
              total = filteredData.reduce((acc, d) => {
                const v = Number((d as any)[firstKey]);
                return acc + (Number.isFinite(v) ? v : 0);
              }, 0);
            } else {
              for (let i = filteredData.length - 1; i >= 0; i--) {
                const v = Number((filteredData[i] as any)[firstKey]);
                if (Number.isFinite(v)) {
                  total = v;
                  break;
                }
              }
            }
          }
          return (
            <CardTitle>
              {config[firstKey || ""]?.label || "Total"}{" "}
              {total.toLocaleString()}
            </CardTitle>
          );
        })()}
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          {mounted ? (
            <>
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={setTimeRange}
                variant="outline"
                className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
              >
                <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
                <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
              </ToggleGroup>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                  size="sm"
                  aria-label="Select a value"
                >
                  <SelectValue placeholder="Last 3 months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d" className="rounded-lg">
                    Last 3 months
                  </SelectItem>
                  <SelectItem value="30d" className="rounded-lg">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="7d" className="rounded-lg">
                    Last 7 days
                  </SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <div className="h-8 w-40" />
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          id="superadmin-chart"
          config={config}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            data={filteredData}
            margin={{ top: 12, right: 6, left: 0, bottom: 12 }}
          >
            <defs>
              {Object.keys(config)
                .filter((k) => k !== "visitors")
                .map((key) => (
                  <linearGradient
                    key={key}
                    id={`fill-${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={config[key]?.color || `var(--color-${key})`}
                      stopOpacity={0.95}
                    />
                    <stop
                      offset="95%"
                      stopColor={config[key]?.color || `var(--color-${key})`}
                      stopOpacity={0.08}
                    />
                  </linearGradient>
                ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip cursor={false} content={<TooltipWithRangeTotals />} />
            {Object.keys(config)
              .filter((k) => k !== "visitors")
              .map((key) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="monotone"
                  fill={`url(#fill-${key})`}
                  stroke={config[key]?.color || `var(--color-${key})`}
                  stackId={key}
                />
              ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
