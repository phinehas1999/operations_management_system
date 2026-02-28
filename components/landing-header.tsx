"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { LayoutDashboard, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 font-bold text-xl">
          <LayoutDashboard className="h-6 w-6" />
          <span><Link href="/">OMS</Link></span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/#features"
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
                <Link href="/#features" className="text-lg font-medium">
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
                  <Button className="w-full justify-start">Get Started</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
