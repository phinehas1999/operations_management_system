import type { SectionCard } from "@/components/section-cards";

export const sectionCardsData: SectionCard[] = [
  {
    description: "Total Tasks",
    title: "64",
    badgeText: "+6%",
    trend: "up",
    footerHeadline: "Active work across teams",
    footerSub: "Includes open and in-progress tasks",
  },
  {
    description: "In Progress",
    title: "18",
    badgeText: "+2%",
    trend: "up",
    footerHeadline: "Currently active",
    footerSub: "Team tasks this week",
  },
  {
    description: "Overdue",
    title: "5",
    badgeText: "-1%",
    trend: "down",
    footerHeadline: "Overdue tasks",
    footerSub: "Needs attention",
  },
  {
    description: "Low Stock Alerts",
    title: "3",
    badgeText: "-25%",
    trend: "down",
    footerHeadline: "Low inventory",
    footerSub: "Below minimum thresholds",
  },
];

export default sectionCardsData;
