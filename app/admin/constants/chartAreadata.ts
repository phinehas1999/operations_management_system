import type { ChartConfig } from "@/components/ui/chart";

export type ChartPoint = { date: string; tasks: number; completed: number };

export const chartAreaData: { data: ChartPoint[]; config: ChartConfig } = {
  data: [
    { date: "2026-02-01", tasks: 12, completed: 7 },
    { date: "2026-02-02", tasks: 15, completed: 9 },
    { date: "2026-02-03", tasks: 18, completed: 12 },
    { date: "2026-02-04", tasks: 14, completed: 10 },
    { date: "2026-02-05", tasks: 16, completed: 11 },
    { date: "2026-02-06", tasks: 13, completed: 9 },
    { date: "2026-02-07", tasks: 17, completed: 13 },
  ],
  config: {
    tasks: { label: "Tasks", color: "var(--chart-1)" },
    completed: { label: "Completed", color: "var(--chart-2)" },
  } satisfies ChartConfig,
};

export default chartAreaData;
