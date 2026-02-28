"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardFooter } from "@/components/ui/card";
import AuthLayout from "@/components/auth-layout";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
        setError("Invalid credentials");
        return;
      }

      toast.success("Signed in — redirecting...");
      // short delay so the toast is visible
      await new Promise((r) => setTimeout(r, 600));

      // Fetch session to get role and redirect appropriately
      const sessionRes = await fetch("/api/auth/session");
      const session = sessionRes.ok ? await sessionRes.json() : null;
      const role = session?.user?.role as
        | "SUPERADMIN"
        | "ADMIN"
        | "MANAGER"
        | "STAFF"
        | undefined;
      const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);

      const target = isSuperAdmin
        ? "/superadmin"
        : role === "ADMIN"
          ? "/admin"
          : role === "MANAGER"
            ? "/manager"
            : role === "STAFF"
              ? "/staff"
              : "/";

      router.push(target);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Sign in" description="Access your company dashboard">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <CardFooter className="flex items-center justify-between px-0">
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <Link
            href="/auth/create_company_account"
            className="text-sm text-primary underline"
          >
            Create company account
          </Link>
        </CardFooter>
      </form>
    </AuthLayout>
  );
}
