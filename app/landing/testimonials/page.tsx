"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/landing-header";
import { Quote, Star, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: "Ava Cole",
    role: "Operations Director",
    company: "Vertex Logistics",
    location: "San Francisco, CA",
    quote:
      "OMS gave our teams a single source of truth. We reduced handoffs and improved asset tracking in the first month.",
    tags: ["Logistics", "Scale"],
    rating: 5,
  },
  {
    name: "Marcus Lee",
    role: "Head of Facilities",
    company: "Northwind Health",
    location: "London, UK",
    quote:
      "Role-based access is a game changer. Managers see what they need, staff stay focused, and audits are painless.",
    tags: ["Healthcare", "Compliance"],
    rating: 5,
  },
  {
    name: "Priya Raman",
    role: "VP Operations",
    company: "Horizon Retail",
    location: "Bangalore, IN",
    quote:
      "We standardized workflows across 12 locations while keeping tenants isolated. The reporting layer is excellent.",
    tags: ["Retail", "Multi-site"],
    rating: 4,
  },
  {
    name: "Diego Alvarez",
    role: "Platform Admin",
    company: "Skyline Services",
    location: "Madrid, ES",
    quote:
      "The superadmin controls let us onboard tenants quickly and keep billing, plans, and settings organized.",
    tags: ["SaaS", "Admin"],
    rating: 5,
  },
  {
    name: "Sarah Kim",
    role: "Ops Manager",
    company: "Atlas Mfg",
    location: "Seoul, KR",
    quote:
      "Task tracking and asset logs keep everyone accountable. OMS turned our daily standups into data-driven check-ins.",
    tags: ["Manufacturing", "Efficiency"],
    rating: 5,
  },
  {
    name: "Noah Brooks",
    role: "COO",
    company: "Meridian Partners",
    location: "New York, NY",
    quote:
      "We finally have a clear view of team performance, overdue tasks, and asset health in one place.",
    tags: ["Consulting", "Visibility"],
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "CTO",
    company: "TechFlow Inc.",
    location: "Austin, TX",
    quote:
      "The API integrations and webhook support allowed us to connect OMS with our existing ERP seamlessly.",
    tags: ["Tech", "Integration"],
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Product Owner",
    company: "Global Solutions",
    location: "Singapore",
    quote:
      "Our tenant onboarding time dropped by 80%. The automated provisioning is a lifesaver.",
    tags: ["Enterprise", "Automation"],
    rating: 4,
  },
];

export default function TestimonialsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".header-content", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
      });

      // Ensure cards start hidden (avoid jump/delay)
      gsap.set(".testimonial-card", { opacity: 0, y: 100 });

      // Staggered Grid Animation (plays when testimonials grid scrolls into view)
      gsap.to(".testimonial-card", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: ".testimonials-grid",
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      // Floating Map Pins Animation (Mock)
      gsap.to(".map-pin", {
        y: -10,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: {
          each: 0.5,
          from: "random",
        },
      });

      // Refresh ScrollTrigger after layout settles to avoid delayed triggers
      if (typeof window !== "undefined") {
        // run one rAF then refresh; also guard with a short timeout to account for images
        requestAnimationFrame(() => ScrollTrigger.refresh());
        setTimeout(() => ScrollTrigger.refresh(), 120);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    // Dim other cards
    gsap.to(".testimonial-card", {
      opacity: 0.4,
      scale: 0.95,
      duration: 0.3,
    });
    // Highlight current
    gsap.to(e.currentTarget, {
      opacity: 1,
      scale: 1.05,
      zIndex: 10,
      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
      duration: 0.3,
      ease: "back.out(1.5)",
    });
  };

  const handleMouseLeave = () => {
    // Reset all
    gsap.to(".testimonial-card", {
      opacity: 1,
      scale: 1,
      zIndex: 1,
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      duration: 0.3,
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20"
    >
      <LandingHeader />

      <main className="flex-1 pt-20">
        {/* Header Section */}
        <section className="relative py-20 px-4 text-center overflow-hidden">
          {/* Abstract Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-125 bg-linear-to-b from-primary/5 to-transparent -z-10" />
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute top-20 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] animate-pulse delay-1000" />

          <div className="header-content mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-md mb-8">
              <Quote className="h-3 w-3" />
              <span>Customer Stories</span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8">
              Trusted by modern operations teams globally.
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Discover how leading companies use OMS to standardize workflows,
              ensure compliance, and scale efficiently.
            </p>
          </div>
        </section>

        {/* Global Impact Map (Stylized) */}
        <section className="container mx-auto px-4 mb-24 hidden md:block">
          <div className="relative w-full h-125 rounded-3xl border bg-muted/20 overflow-hidden flex items-center justify-center">
            {/* Map Container - Centered and Aspect Ratio Preserved */}
            <div className="relative w-full max-w-4xl aspect-[1.53] opacity-20 dark:opacity-40">
              <img
                src="/world-map.svg"
                alt="World Map"
                className="w-full h-full object-contain dark:invert"
              />
              {/* Animated Pins - Positioned relative to the map */}
              {[
                { t: "25%", l: "22%" }, // North America (approx)
                { t: "35%", l: "50%" }, // Europe
                { t: "45%", l: "75%" }, // Asia
                { t: "65%", l: "30%" }, // South America
                { t: "55%", l: "55%" }, // Africa
                { t: "75%", l: "85%" }, // Australia
              ].map((pos, i) => (
                <div
                  key={i}
                  className="map-pin absolute w-3 h-3 bg-primary rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] shadow-primary"
                  style={{ top: pos.t, left: pos.l }}
                >
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center bg-background/60 backdrop-blur-sm p-8 rounded-3xl border shadow-sm">
                <h3 className="text-2xl font-bold mb-2">Global Reach</h3>
                <p className="text-muted-foreground">
                  Serving tenants across 12 countries
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Masonry Grid */}
        <section className="testimonials-grid container mx-auto px-4 pb-24">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="testimonial-card relative break-inside-avoid rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 cursor-default group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, stars) => (
                      <Star
                        key={stars}
                        className={`h-4 w-4 ${stars < item.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-primary/10 rotate-180" />
                </div>

                <blockquote className="text-lg font-medium leading-relaxed mb-6">
                  "{item.quote}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={`https://i.pravatar.cc/150?u=${item.name}`}
                    />
                    <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.role}, {item.company}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag, t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-gray-500/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Verified User
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-24 border-t bg-muted/10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to write your success story?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/create_company_account">
                <Button size="lg" className="h-12 px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/landing/pricing">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 text-center text-sm text-muted-foreground bg-background">
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
