import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/landing-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ava Cole",
    role: "Operations Director, Vertex Logistics",
    quote:
      "OMS gave our teams a single source of truth. We reduced handoffs and improved asset tracking in the first month.",
  },
  {
    name: "Marcus Lee",
    role: "Head of Facilities, Northwind Health",
    quote:
      "Role-based access is a game changer. Managers see what they need, staff stay focused, and audits are painless.",
  },
  {
    name: "Priya Raman",
    role: "VP Operations, Horizon Retail",
    quote:
      "We standardized workflows across 12 locations while keeping tenants isolated. The reporting layer is excellent.",
  },
  {
    name: "Diego Alvarez",
    role: "Platform Admin, Skyline Services",
    quote:
      "The superadmin controls let us onboard tenants quickly and keep billing, plans, and settings organized.",
  },
  {
    name: "Sarah Kim",
    role: "Operations Manager, Atlas Manufacturing",
    quote:
      "Task tracking and asset logs keep everyone accountable. OMS turned our daily standups into data-driven check-ins.",
  },
  {
    name: "Noah Brooks",
    role: "COO, Meridian Partners",
    quote:
      "We finally have a clear view of team performance, overdue tasks, and asset health in one place.",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        <section className="container py-10 md:py-16 lg:py-20 mx-auto px-4">
          <div className="mx-auto flex max-w-240 flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-xs font-medium text-foreground/80 shadow-sm">
              <Quote className="h-3.5 w-3.5" />
              Customer Stories
            </div>
            <h1 className="mt-4 font-heading text-3xl sm:text-5xl md:text-6xl font-bold">
              Teams trust OMS to run daily operations
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground sm:text-lg">
              From logistics to healthcare, OMS helps teams unify workflows,
              maintain audit-ready records, and move faster with confident
              visibility.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-280 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container pb-10 md:pb-16 lg:pb-20 mx-auto px-4">
          <div className="mx-auto flex max-w-240 flex-col items-center gap-4 rounded-2xl border bg-background p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">
              Ready to share your own success story?
            </h2>
            <p className="text-muted-foreground">
              Launch your tenant, invite your teams, and begin tracking
              operations in a single, secure workspace.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/create_company_account">
                <Button>Start with OMS</Button>
              </Link>
              <Link href="/landing/pricing">
                <Button variant="outline">View Pricing</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
