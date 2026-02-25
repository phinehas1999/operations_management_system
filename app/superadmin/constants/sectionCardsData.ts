import type { SectionCard } from "@/components/section-cards";

export const sectionCardsData: SectionCard[] = [
  {
    description: "Total Tenants",
    title: "128",
    badgeText: "+3%",
    trend: "up",
    footerHeadline: "Net new tenants this month",
    footerSub: "Provisioned and active tenants",
  },
  {
    description: "Platform Revenue",
    title: "$42,350",
    badgeText: "+8.2%",
    trend: "up",
    footerHeadline: "Month-to-date revenue",
    footerSub: "Billing across all tenants",
  },
  {
    description: "Open Incidents",
    title: "4",
    badgeText: "-40%",
    trend: "down",
    footerHeadline: "Reduced incidents",
    footerSub: "Active issues across tenants",
  },
  {
    description: "Provisioning Queue",
    title: "2",
    badgeText: "-50%",
    trend: "down",
    footerHeadline: "Pending tenant setups",
    footerSub: "Queue for manual verification",
  },
];

export default sectionCardsData;
