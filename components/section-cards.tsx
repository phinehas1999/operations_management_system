import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type SectionCard = {
  description: string;
  title: string;
  badgeText: string;
  trend: "up" | "down";
  footerHeadline: string;
  footerSub: string;
};

export function SectionCards({ items }: { items: SectionCard[] }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} className="@container/card">
          <CardHeader>
            <CardDescription>{item.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {item.title}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {item.trend === "up" ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {item.badgeText}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {item.footerHeadline}{" "}
              {item.trend === "up" ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">{item.footerSub}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
