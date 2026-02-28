import type { ChartConfig } from "@/components/ui/chart";

export type ChartPoint = { date: string; tasks: number; completed: number };

export const chartAreaData: { data: ChartPoint[]; config: ChartConfig } = {
  data: [
    { date: "2026-02-01", tasks: 6, completed: 3 },
    { date: "2026-02-02", tasks: 7, completed: 5 },
    { date: "2026-02-03", tasks: 8, completed: 6 },
    { date: "2026-02-04", tasks: 5, completed: 4 },
    { date: "2026-02-05", tasks: 9, completed: 6 },
    { date: "2026-02-06", tasks: 6, completed: 5 },
    { date: "2026-02-07", tasks: 7, completed: 6 },
  ],
  config: {
    tasks: { label: "Tasks", color: "var(--chart-1)" },
    completed: { label: "Completed", color: "var(--chart-2)" },
  } satisfies ChartConfig,
};

export default chartAreaData;
