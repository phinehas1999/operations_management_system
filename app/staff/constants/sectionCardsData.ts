import type { SectionCard } from "@/components/section-cards";

export const sectionCardsData: SectionCard[] = [
  {
    description: "My Tasks",
    title: "12",
    badgeText: "+2%",
    trend: "up",
    footerHeadline: "Assigned this week",
    footerSub: "Across active shifts",
  },
  {
    description: "In Progress",
    title: "4",
    badgeText: "+1%",
    trend: "up",
    footerHeadline: "Currently active",
    footerSub: "Tasks you are working on",
  },
  {
    description: "Overdue",
    title: "1",
    badgeText: "-1%",
    trend: "down",
    footerHeadline: "Needs follow-up",
    footerSub: "Due within 24 hours",
  },
  {
    description: "Notifications",
    title: "3",
    badgeText: "+1",
    trend: "up",
    footerHeadline: "Unread alerts",
    footerSub: "Task and asset updates",
  },
];

export default sectionCardsData;
