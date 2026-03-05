"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe2,
  Menu,
  CheckCircle2,
  Users,
  Search,
  Lock,
  Boxes,
  Activity,
  CreditCard,
  FileText,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation Timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-badge",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
      )
        .fromTo(
          ".hero-title-line",
          { y: 50, opacity: 0, rotateX: -20 },
          { y: 0, opacity: 1, rotateX: 0, stagger: 0.15, duration: 1 },
          "-=0.4",
        )
        .fromTo(
          ".hero-desc",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6",
        )
        .fromTo(
          ".hero-btns",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6",
        )
        .fromTo(
          dashboardRef.current,
          { y: 100, opacity: 0, scale: 0.95, rotateX: 10 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 1.5,
            ease: "expo.out",
          },
          "-=0.8",
        );

      // Dashboard Interactive Tilt
      const dashboard = dashboardRef.current;
      if (dashboard) {
        dashboard.addEventListener("mousemove", (e) => {
          const rect = dashboard.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          gsap.to(dashboard, {
            rotationY: x * 8, // Increased tilt
            rotationX: -y * 8,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1000,
          });
        });

        dashboard.addEventListener("mouseleave", () => {
          gsap.to(dashboard, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
          });
        });
      }

      // Features Scroll Animations
      const features = document.querySelectorAll(".feature-card");
      features.forEach((feature, i) => {
        gsap.fromTo(
          feature,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: feature,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            delay: (i % 3) * 0.1, // Stagger based on column index approximation
          },
        );
      });

      // Stats Counter Animation
      const stats = document.querySelectorAll(
        ".stat-number",
      ) as NodeListOf<HTMLElement>;

      stats.forEach((statEl) => {
        const val = parseInt(statEl.getAttribute("data-value") || "0", 10) || 0;

        gsap.fromTo(
          statEl,
          { innerText: 0 },
          {
            innerText: val,
            duration: 2.5,
            ease: "power1.inOut",
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
            },
            onUpdate: function () {
              const current =
                Number((this.targets()[0] as HTMLElement).innerText) || 0;
              statEl.innerText = Math.ceil(current).toLocaleString();
            },
          },
        );
      });

      // Infinite Marquee for "Trusted By" (using CSS animation but trigger visibility)
      gsap.fromTo(
        ".marquee-track",
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 1 },
      );
    }, heroRef); // Scope to heroRef container, but mindful of global selectors if multiple components on page

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Navbar with Glassmorphism */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8 relative">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden transition-transform group-hover:scale-105">
              <LayoutDashboard className="h-5 w-5 relative z-10" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight">OMS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Platform
            </Link>
            <Link
              href="/landing/testimonials"
              className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Customers
            </Link>
            <Link
              href="/landing/pricing"
              className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Pricing
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium hover:bg-muted/50">
                Log in
              </Button>
            </Link>
            <Link href="/auth/create_company_account">
              <Button className="font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-75 sm:w-100">
                <nav className="flex flex-col gap-6 mt-10">
                  <Link
                    href="#features"
                    className="text-2xl font-semibold tracking-tight"
                  >
                    Platform
                  </Link>
                  <Link
                    href="/landing/testimonials"
                    className="text-2xl font-semibold tracking-tight"
                  >
                    Customers
                  </Link>
                  <Link
                    href="/landing/pricing"
                    className="text-2xl font-semibold tracking-tight"
                  >
                    Pricing
                  </Link>
                  <hr className="border-muted" />
                  <div className="flex flex-col gap-3 mt-4">
                    <Link href="/auth/login">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-center text-lg"
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/auth/create_company_account">
                      <Button
                        size="lg"
                        className="w-full justify-center text-lg"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Dynamic Background Pattern */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div
            className="absolute top-[20%] right-[-10%] w-150 h-150 bg-primary/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-blue-500/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse"
            style={{ animationDuration: "7s" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative pt-20 pb-20 md:pt-32 lg:pt-40 lg:pb-32 overflow-hidden"
        >
          <div className="container relative z-10 mx-auto px-4">
            <div
              ref={textRef}
              className="mx-auto max-w-5xl flex flex-col items-center text-center"
            >
              <h1 className="mb-8 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl leading-[1.1] sm:leading-[1.1]">
                <span className="hero-title-line block bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
                  Control Your Operations.
                </span>
                <span className="hero-title-line block text-primary mt-2">
                  Without The Chaos.
                </span>
              </h1>

              <p className="hero-desc mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                The enterprise-grade OS for modern teams. Orchestrate tasks,
                manage dispersed assets, and enforce security policies across
                multiple tenants—all from one command center.
              </p>

              <div className="hero-btns flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <Link
                  href="/auth/create_company_account"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="h-14 w-full sm:w-auto px-8 text-base shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/landing/pricing" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 w-full sm:w-auto px-8 text-base backdrop-blur-sm bg-background/50 hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>

            {/* 3D Dashboard Mockup */}
            <div
              ref={dashboardRef}
              className="mt-20 relative mx-auto max-w-6xl w-full perspective-[2000px] group"
            >
              {/* Dashboard Container */}
              <div className="relative rounded-xl border bg-background shadow-2xl overflow-hidden ring-1 ring-white/10 dark:ring-white/5 transform-preserve-3d">
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none z-20" />

                {/* Mock UI Header */}
                <div className="border-b bg-muted/40 p-4 flex items-center justify-between backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400 border border-red-500/20" />
                      <div className="h-3 w-3 rounded-full bg-amber-400 border border-amber-500/20" />
                      <div className="h-3 w-3 rounded-full bg-green-400 border border-green-500/20" />
                    </div>
                    <div className="hidden sm:flex h-8 w-64 items-center rounded-md bg-background/50 border px-3 text-xs text-muted-foreground">
                      <Search className="h-3 w-3 mr-2" />
                      Search assets, tasks, or users...
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                    <div className="h-8 w-8 rounded-full bg-muted" />
                  </div>
                </div>

                {/* Mock UI Body */}
                <div className="grid grid-cols-12 h-125 md:h-162.5 bg-background/50">
                  {/* Sidebar */}
                  <div className="hidden md:block col-span-2 border-r bg-muted/10 p-4 space-y-6">
                    <div className="space-y-1">
                      <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Main
                      </div>
                      {["Dashboard", "Team", "Tasks", "Assets"].map(
                        (item, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-colors ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
                          >
                            <div
                              className={`h-4 w-4 rounded ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`}
                            />
                            {item}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Admin
                      </div>
                      {["Audit Logs", "Billing", "Settings"].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-4 w-4 rounded bg-muted-foreground/30" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="col-span-12 md:col-span-10 p-6 md:p-8 bg-muted/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold">Overview</h3>
                        <p className="text-muted-foreground">
                          Welcome back, Administrator.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-9 w-24 rounded border bg-background" />
                        <div className="h-9 w-32 rounded bg-primary" />
                      </div>
                    </div>

                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {[
                        {
                          label: "Total Revenue",
                          val: "$45,231.89",
                          trend: "+20.1%",
                          positive: true,
                        },
                        {
                          label: "Active Tasks",
                          val: "342",
                          trend: "+12",
                          positive: true,
                        },
                        {
                          label: "Pending Audits",
                          val: "7",
                          trend: "-2",
                          positive: true,
                        }, // Logic: less audits is good maybe?
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="rounded-xl border bg-background p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="text-sm font-medium text-muted-foreground">
                              {stat.label}
                            </div>
                            <div className="h-4 w-4 rounded-full bg-muted" />
                          </div>
                          <div className="text-2xl font-bold mb-1">
                            {stat.val}
                          </div>
                          <div className="text-xs text-green-500 font-medium">
                            {stat.trend} from last month
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart & Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                      <div className="lg:col-span-2 rounded-xl border bg-background p-6 shadow-sm h-64 md:h-80 flex flex-col">
                        <div className="mb-6 flex items-center justify-between">
                          <h4 className="font-semibold">Activity Overview</h4>
                        </div>
                        <div className="flex-1 flex items-end gap-3 pb-2 px-2">
                          {[
                            35, 55, 40, 70, 60, 85, 65, 95, 75, 60, 80, 50, 65,
                            90,
                          ].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                              <div
                                style={{ height: `${h}%` }}
                                className="w-full bg-primary/10 rounded-t-sm group-hover:bg-primary transition-all duration-300 relative overflow-hidden"
                              >
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border bg-background p-6 shadow-sm h-64 md:h-80">
                        <h4 className="font-semibold mb-4">Recent Audits</h4>
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                U{i}
                              </div>
                              <div className="flex-1">
                                <div className="h-3 w-2/3 rounded bg-foreground/10 mb-1.5" />
                                <div className="h-2 w-1/3 rounded bg-muted" />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                2m ago
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements (Parallax) */}
              <div
                className="absolute -left-6 -bottom-6 md:top-1/3 md:-left-12 p-4 rounded-xl border bg-card shadow-2xl backdrop-blur animate-float"
                style={{ animationDuration: "6s" }}
              >
                <div className="flex items-center gap-4 min-w-50">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Security Check
                    </p>
                    <p className="font-bold text-sm">RBAC Policies Enforced</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -right-6 top-1/4 p-4 rounded-xl border bg-card shadow-2xl backdrop-blur animate-float"
                style={{ animationDuration: "5s", animationDelay: "1s" }}
              >
                <div className="flex items-center gap-4 min-w-45">
                  <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Live Feed
                    </p>
                    <p className="font-bold text-sm">+12 New Tasks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Scroll Section */}
        <section className="border-y bg-muted/20 py-10 overflow-hidden">
          <div className="container mx-auto px-4 mb-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Trusted by innovative operations teams
            </p>
          </div>
          <div className="marquee-track flex gap-12 items-center justify-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap px-4">
            {/* Fake Logos for generic industry names */}
            {[
              "Acme Corp",
              "Globex",
              "Soylent",
              "Initech",
              "Massive Dynamic",
              "Cyberdyne",
            ].map((name, i) => (
              <div
                key={i}
                className="text-xl md:text-2xl font-black text-foreground/40 select-none"
              >
                {name}
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section
          id="features"
          ref={featuresRef}
          className="py-24 lg:py-32 bg-background relative"
        >
          <div className="container mx-auto px-4">
            <div className="mb-20 md:text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6">
                The Complete Operations Stack
              </h2>
              <p className="text-xl text-muted-foreground">
                Built to handle complexity. We provide the primitives you need
                to build robust operational workflows without the spreadsheet
                chaos.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                  title: "Role-Based Access Control",
                  desc: "Define strict boundaries. Superadmins control the platform, Managers oversee teams, and Staff focus on execution. Security is baked in, not bolted on.",
                },
                {
                  icon: Boxes, // Multi-tenant
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                  title: "Multi-Tenant Architecture",
                  desc: "True data isolation. Each tenant operates in its own logical silo with custom branding, settings, and billing plans. Perfect for SaaS or franchise models.",
                },
                {
                  icon: Zap,
                  color: "text-amber-500",
                  bg: "bg-amber-500/10",
                  title: "High-Velocity Task Engine",
                  desc: "Create, assign, and track tasks with sub-second latency. Set priorities, deadlines, and dependencies to keep your workforce moving.",
                },
                {
                  icon: FileText, // Audit Logs
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                  title: "Comprehensive Audit Logs",
                  desc: "Compliance ready. Every CREATE, UPDATE, and DELETE action is logged with user ID, timestamp, and metadata changes.",
                },
                {
                  icon: Users,
                  color: "text-pink-500",
                  bg: "bg-pink-500/10",
                  title: "Team & Workforce Management",
                  desc: "Group users into functional teams. Delegate management responsibilities and streamline resource allocation effectively.",
                },
                {
                  icon: CreditCard, // Billing
                  color: "text-indigo-500",
                  bg: "bg-indigo-500/10",
                  title: "Integrated Billing & Invoicing",
                  desc: "Automated subscription management. Handle plan upgrades, generate invoices, and track revenue per tenant seamlessly.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="feature-card group relative overflow-hidden rounded-3xl border bg-card p-8 transition-all hover:bg-muted/30 hover:shadow-xl hover:-translate-y-1"
                >
                  <div
                    className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Hover effect border bottom */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-transparent via-primary to-transparent transition-all duration-500 group-hover:w-full opacity-50" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section with ScrollTrigger */}
        <section
          ref={statsRef}
          className="border-y bg-muted/50 py-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="container relative z-10 mx-auto px-4">
            <div className="grid grid-cols-2 gap-12 md:grid-cols-4 text-center divide-x divide-border/50">
              {[
                { label: "Active Tenants", value: "520", suffix: "+" },
                { label: "Tasks Completed", value: "85000", suffix: "+" },
                { label: "Audit Events", value: "1200", suffix: "k" },
                { label: "Uptime", value: "99", suffix: ".9%" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center p-4">
                  <div className="text-5xl md:text-6xl font-black mb-4 flex items-baseline tracking-tighter text-foreground">
                    <span className="stat-number" data-value={stat.value}>
                      0
                    </span>
                    <span className="text-4xl text-muted-foreground/50 ml-1">
                      {stat.suffix}
                    </span>
                  </div>
                  <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="container relative z-10 mx-auto px-4">
            <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-foreground text-background shadow-2xl overflow-hidden relative">
              {/* Background pattern */}
              <div className="absolute top-0 right-0 w-100 h-100 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 p-12 lg:p-20 text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-8 text-background">
                  Build your operating system today.
                </h2>
                <p className="text-xl text-background/70 mb-12 max-w-2xl mx-auto">
                  Join hundreds of data-driven teams. Launch your tenant in
                  seconds, not months.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/create_company_account">
                    <Button
                      size="lg"
                      className="h-14 px-10 text-lg bg-background text-foreground hover:bg-background/90 hover:scale-105 transition-all"
                    >
                      Start 14-Day Free Trial
                    </Button>
                  </Link>
                  <Link href="/landing/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-10 text-lg bg-background text-foreground hover:bg-background/90 hover:scale-105 transition-all"
                    >
                      Compare Plans
                    </Button>
                  </Link>
                </div>
                <p className="mt-8 text-sm text-background/40">
                  No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xl font-bold">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <span>OMS</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-70">
                Empowering organizations with secure, scalable, and intelligent
                operations management infrastructure.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Platform
                  </Link>
                </li>
                <li>
                  <Link
                    href="/landing/pricing"
                    className="hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} OMS Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Globe2 className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              {/* Add social icons if needed */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
