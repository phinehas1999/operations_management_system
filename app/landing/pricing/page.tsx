"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/landing-header";
import {
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".pricing-header", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
      });

      // Cards Animation — avoid setting inline start styles immediately
      gsap.from(".pricing-card", {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.2,
        delay: 0.5,
        immediateRender: false,
        clearProps: "opacity,transform",
      });

      // Comparison Table Animation
      gsap.from(".comparison-section", {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: ".comparison-section",
          start: "top 80%",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Hover effect for cards
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.02,
      y: -10,
      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      y: 0,
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const plans = [
    {
      name: "Starter",
      desc: "Perfect for small teams getting organized.",
      price: 0,
      yearlyPrice: 0,
      features: [
        "Up to 3 Users",
        "Basic Task Management",
        "1 Team",
        "Email Support",
        "Standard Audit Logs (7 days)",
      ],
      notIncluded: [
        "Multiple Teams",
        "Advanced Roles (Manager)",
        "API Access",
        "Custom Branding",
      ],
      cta: "Start for Free",
      variant: "outline" as const,
    },
    {
      name: "Pro",
      desc: "For growing organizations needing full control.",
      price: 29,
      yearlyPrice: 299, // ~25/mo
      badge: "Most Popular",
      features: [
        "Up to 25 Users",
        "Unlimited Teams",
        "Advanced Roles (Admin, Manager)",
        "Priority Support",
        "Unlimited Audit Logs",
        "Asset Management",
        "Billing & Invoicing",
      ],
      notIncluded: [],
      cta: "Start 14-Day Trial",
      variant: "default" as const,
    },
    {
      name: "Enterprise",
      desc: "Custom solutions for large scale operations.",
      price: "Custom",
      yearlyPrice: "Custom",
      features: [
        "Unlimited Users",
        "Dedicated Success Manager",
        "SLA Guarantees",
        "Custom Integrations",
        "On-premise Deployment Options",
        "Advanced Security Controls",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      variant: "outline" as const,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20"
    >
      <LandingHeader />

      <main className="flex-1 pt-20">
        {/* Header Section */}
        <section className="relative py-20 px-4 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/5 rounded-full blur-[120px] -z-10" />

          <div className="pricing-header mx-auto max-w-3xl">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6">
              Simple, transparent pricing.
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Choose the plan that fits your operational scale. No hidden fees.
              Cancel anytime.
            </p>

            <div className="flex items-center justify-center gap-4 mb-16">
              <span
                className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="scale-125 data-[state=checked]:bg-primary"
              />
              <span
                className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
              >
                Yearly{" "}
                <span className="text-xs text-green-500 font-bold ml-1">
                  (Save 15%)
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section ref={cardsRef} className="container mx-auto px-4 pb-24">
          <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`pricing-card relative flex flex-col rounded-3xl border bg-card p-8 shadow-sm transition-all duration-300 ${plan.variant === "default" ? "border-primary/50 ring-4 ring-primary/10 shadow-2xl z-10 scale-105 md:scale-110" : "hover:border-primary/20"}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 min-h-10">
                    {plan.desc}
                  </p>
                </div>

                <div className="mb-8 flex items-baseline">
                  {typeof plan.price === "number" ? (
                    <>
                      <span className="text-5xl font-extrabold tracking-tight">
                        ${isYearly ? plan.yearlyPrice : plan.price}
                      </span>
                      <span className="ml-2 text-muted-foreground font-medium">
                        {isYearly && typeof plan.yearlyPrice === "number"
                          ? "/year"
                          : "/mo"}
                      </span>
                    </>
                  ) : (
                    <span className="text-5xl font-extrabold tracking-tight">
                      Custom
                    </span>
                  )}
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-medium text-foreground/90">
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <li
                      key={`not-${idx}`}
                      className="flex items-start gap-3 text-sm text-muted-foreground/60"
                    >
                      <XCircle className="h-5 w-5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/auth/create_company_account" className="w-full">
                  <Button
                    variant={plan.variant}
                    className={`w-full h-12 text-base rounded-xl font-bold ${plan.variant === "default" ? "shadow-lg shadow-primary/25 hover:shadow-primary/40" : ""}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="comparison-section container mx-auto px-4 py-24 border-t bg-muted/20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">
              Compare features
            </h2>

            <div className="rounded-2xl border bg-background overflow-hidden shadow-sm">
              <div className="grid grid-cols-4 p-6 border-b bg-muted/40 text-sm font-semibold">
                <div className="col-span-1">Feature</div>
                <div className="text-center">Starter</div>
                <div className="text-center text-primary">Pro</div>
                <div className="text-center">Enterprise</div>
              </div>

              {[
                {
                  cat: "Core Features",
                  items: [
                    { name: "Users", v1: "3", v2: "25", v3: "Unlimited" },
                    {
                      name: "Teams",
                      v1: "1",
                      v2: "Unlimited",
                      v3: "Unlimited",
                    },
                    {
                      name: "Storage",
                      v1: "1GB",
                      v2: "100GB",
                      v3: "Unlimited",
                    },
                  ],
                },
                {
                  cat: "Security & Control",
                  items: [
                    {
                      name: "Audit Logs",
                      v1: "7 Days",
                      v2: "Unlimited",
                      v3: "Unlimited",
                    },
                    { name: "SAML SSO", v1: false, v2: false, v3: true },
                    {
                      name: "Role-Based Access",
                      v1: "Basic",
                      v2: "Advanced",
                      v3: "Custom",
                    },
                  ],
                },
                {
                  cat: "Support",
                  items: [
                    { name: "Email Support", v1: true, v2: true, v3: true },
                    {
                      name: "Priority Response",
                      v1: false,
                      v2: true,
                      v3: true,
                    },
                    { name: "Dedicated CSM", v1: false, v2: false, v3: true },
                  ],
                },
              ].map((category, i) => (
                <div key={i}>
                  <div className="px-6 py-3 bg-muted/10 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                    {category.cat}
                  </div>
                  {category.items.map((row, r) => (
                    <div
                      key={r}
                      className="grid grid-cols-4 px-6 py-4 border-b last:border-0 hover:bg-muted/5 transition-colors items-center text-sm"
                    >
                      <div className="font-medium flex items-center gap-2">
                        {row.name}
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                      </div>
                      <div className="text-center text-muted-foreground">
                        {typeof row.v1 === "boolean" ? (
                          row.v1 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-4 h-0.5 bg-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          row.v1
                        )}
                      </div>
                      <div className="text-center font-semibold text-foreground">
                        {typeof row.v2 === "boolean" ? (
                          row.v2 ? (
                            <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <div className="w-4 h-0.5 bg-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          row.v2
                        )}
                      </div>
                      <div className="text-center text-muted-foreground">
                        {typeof row.v3 === "boolean" ? (
                          row.v3 ? (
                            <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <div className="w-4 h-0.5 bg-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          row.v3
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section Trigger */}
        <section className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-8">
            We're here to help. Check out our documentation or contact our
            support team.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="#">
              <Button variant="outline">View Documentation</Button>
            </Link>
            <Link href="/auth/create_company_account">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            © {new Date().getFullYear()} Operations Management System. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
