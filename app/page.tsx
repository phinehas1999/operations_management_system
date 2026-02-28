import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  CheckCircle2,
  LayoutDashboard,
  ShieldCheck,
  Users,
  ArrowRight,
  Menu,
  Layers,
  Workflow,
  Globe2,
  Sparkles,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 font-bold text-xl">
            <LayoutDashboard className="h-6 w-6" />
            <span><Link href="/">OMS</Link></span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="#features"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Features
            </Link>
            <Link
              href="/landing/testimonials"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Testimonials
            </Link>
            <Link
              href="/landing/pricing"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Pricing
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <Link href="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/auth/create_company_account">
              <Button>Get Started</Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="flex md:hidden items-center gap-4">
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="#features" className="text-lg font-medium">
                    Features
                  </Link>
                  <Link
                    href="/landing/testimonials"
                    className="text-lg font-medium"
                  >
                    Testimonials
                  </Link>
                  <Link href="/landing/pricing" className="text-lg font-medium">
                    Pricing
                  </Link>
                  <hr className="my-4" />
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full justify-start">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/create_company_account">
                    <Button className="w-full justify-start">
                      Get Started
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-8 pt-8 md:pb-12 md:pt-12 lg:py-28">
          <div className="hero-bg" aria-hidden="true">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-grid" />
          </div>
          <div className="container relative z-10 flex max-w-272 flex-col items-center gap-6 text-center mx-auto px-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-xs font-medium text-foreground/80 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              OMS - Operations Management System
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Orchestrate teams, assets, and tasks with
              <span className="text-primary"> OMS</span>
            </h1>
            <p className="max-w-3xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              A production-ready, multi-tenant operations platform with
              role-based access, real-time reporting, and secure data
              segregation for every tenant.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/auth/create_company_account">
                <Button size="lg" className="gap-2">
                  Create Company Account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/landing/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="mt-4 grid w-full max-w-4xl grid-cols-2 gap-4 text-left sm:grid-cols-3">
              <div className="rounded-lg border bg-background/80 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Tenant Roles</p>
                <p className="text-lg font-semibold">Admin, Manager, Staff</p>
              </div>
              <div className="rounded-lg border bg-background/80 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Audit Ready</p>
                <p className="text-lg font-semibold">Logs & Reporting</p>
              </div>
              <div className="rounded-lg border bg-background/80 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Security</p>
                <p className="text-lg font-semibold">RBAC + JWT</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="container space-y-8 bg-slate-50 py-10 dark:bg-transparent md:py-14 lg:py-24 mx-auto px-4"
        >
          <div className="mx-auto flex max-w-232 flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
              Built for real operations teams
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              OMS aligns with the core pillars from our implementation plan:
              secure tenants, predictable roles, and measurable performance.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-272 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Organize your workforce with roles and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                Manage users, assign roles (Admin, Manager, Staff), and track
                performance effortlessly.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <ShieldCheck className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Secure your data with granular permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                Ensure the right people have access to the right information
                with our advanced RBAC system.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Insightful Reporting</CardTitle>
                <CardDescription>
                  Data-driven decisions made easy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                Generate comprehensive reports on tasks, assets, and team
                productivity in real-time.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <LayoutDashboard className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Task Tracking</CardTitle>
                <CardDescription>Never miss a deadline again.</CardDescription>
              </CardHeader>
              <CardContent>
                Create, assign, and track tasks across teams with priority,
                status, and deadline controls.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Asset Management</CardTitle>
                <CardDescription>
                  Keep track of your physical and digital assets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                Monitor inventory, thresholds, and lifecycle actions with
                auditable asset logs.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Globe2 className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Multi-Tenant Platform</CardTitle>
                <CardDescription>Securely isolated tenants.</CardDescription>
              </CardHeader>
              <CardContent>
                Operate across many organizations with tenant-level scoping,
                billing tiers, and platform controls.
              </CardContent>
            </Card>
          </div>
          <div className="mx-auto mt-6 grid max-w-272 gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-background p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">
                  Multi-tenant architecture
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Separate tenants, branding, and permissions with centralized
                observability for platform admins.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Workflow className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Operational workflows</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Tasks, assets, and notifications come together in a clear
                execution flow with audit support.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Secure authentication</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                JWT-based sessions, password hashing, and role-aware middleware
                ensure compliance and stability.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-10 md:py-14 lg:py-24 mx-auto px-4">
          <div className="mx-auto flex max-w-232 flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
              Ready to get started?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Launch your tenant, invite your team, and begin tracking work with
              OMS.
            </p>
            <Link href="/auth/create_company_account">
              <Button size="lg" className="mt-4">
                Create Your Company Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col item-center justify-between gap-4 md:h-24 md:flex-row mx-auto px-4">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <LayoutDashboard className="h-6 w-6" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by{" "}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                OMS Platform Team
              </a>
              . The source code is available on{" "}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                GitHub
              </a>
              .
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="#" className="hover:underline underline-offset-4">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
