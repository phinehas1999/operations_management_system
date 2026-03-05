"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { LayoutDashboard, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function LandingHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden transition-transform group-hover:scale-105">
            <LayoutDashboard className="h-5 w-5 relative z-10" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </div>
          <span className="text-xl font-bold tracking-tight">OMS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link
            href="/#features"
            className="hover:text-foreground transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            Platform
          </Link>
          <Link
            href="/landing/testimonials"
            className="hover:text-foreground transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            Customers
          </Link>
          <Link
            href="/landing/pricing"
            className="hover:text-foreground transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
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

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-4">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-10">
                <Link
                  href="/#features"
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
                    <Button size="lg" className="w-full justify-center text-lg">
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
  );
}
