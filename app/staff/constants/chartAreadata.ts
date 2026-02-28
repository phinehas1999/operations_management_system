import type { ChartConfig } from "@/components/ui/chart";

export type ChartPoint = { date: string; tasks: number; completed: number };

export const chartAreaData: { data: ChartPoint[]; config: ChartConfig } = {
  data: [
    { date: "2026-02-01", tasks: 3, completed: 2 },
    { date: "2026-02-02", tasks: 4, completed: 3 },
    { date: "2026-02-03", tasks: 5, completed: 4 },
    { date: "2026-02-04", tasks: 3, completed: 3 },
    { date: "2026-02-05", tasks: 6, completed: 4 },
    { date: "2026-02-06", tasks: 4, completed: 3 },
    { date: "2026-02-07", tasks: 5, completed: 4 },
  ],
  config: {
    tasks: { label: "Tasks", color: "var(--chart-1)" },
    completed: { label: "Completed", color: "var(--chart-2)" },
  } satisfies ChartConfig,
};

export default chartAreaData;
