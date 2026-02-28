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
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$39",
    description: "For small teams launching their first tenant.",
    features: [
      "Up to 25 users",
      "Core task and asset tracking",
      "Role-based access",
      "Standard reporting",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$129",
    description: "For scaling operations and multiple teams.",
    badge: "Most popular",
    features: [
      "Up to 250 users",
      "Advanced reporting",
      "Team-level workflows",
      "Audit logs",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For multi-tenant platforms and large organizations.",
    features: [
      "Unlimited users",
      "Superadmin controls",
      "Custom SLA and onboarding",
      "Dedicated success manager",
      "Custom integrations",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        <section className="container py-10 md:py-16 lg:py-20 mx-auto px-4">
          <div className="mx-auto flex max-w-240 flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-xs font-medium text-foreground/80 shadow-sm">
              Pricing
            </div>
            <h1 className="mt-4 font-heading text-3xl sm:text-5xl md:text-6xl font-bold">
              Flexible plans for every tenant size
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground sm:text-lg">
              Choose a plan that fits your operational maturity. Upgrade as you
              scale and unlock additional reporting, workflows, and platform
              tooling.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-280 gap-4 md:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.name} className="flex h-full flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{tier.name}</CardTitle>
                    {tier.badge ? <Badge>{tier.badge}</Badge> : null}
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="text-3xl font-bold">{tier.price}</div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link href="/auth/create_company_account">
                      <Button className="w-full">Start with OMS</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container pb-10 md:pb-16 lg:pb-20 mx-auto px-4">
          <div className="mx-auto flex max-w-240 flex-col items-center gap-4 rounded-2xl border bg-background p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">
              Need a tailored rollout strategy?
            </h2>
            <p className="text-muted-foreground">
              We help multi-tenant platforms with tenant migration, compliance,
              and custom integrations.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/landing/testimonials">
                <Button variant="outline">Read Testimonials</Button>
              </Link>
              <Link href="/auth/create_company_account">
                <Button>Contact Sales</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
