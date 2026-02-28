import type { SectionCard } from "@/components/section-cards";

export const sectionCardsData: SectionCard[] = [
  {
    description: "Team Tasks",
    title: "28",
    badgeText: "+4%",
    trend: "up",
    footerHeadline: "Active tasks this week",
    footerSub: "Across assigned team members",
  },
  {
    description: "In Progress",
    title: "9",
    badgeText: "+1%",
    trend: "up",
    footerHeadline: "Currently active",
    footerSub: "Team workload in motion",
  },
  {
    description: "Overdue",
    title: "2",
    badgeText: "-1%",
    trend: "down",
    footerHeadline: "Overdue tasks",
    footerSub: "Need follow-up today",
  },
  {
    description: "Low Stock Alerts",
    title: "1",
    badgeText: "-20%",
    trend: "down",
    footerHeadline: "Low inventory",
    footerSub: "Monitor restock requests",
  },
];

export default sectionCardsData;
