"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardFooter } from "@/components/ui/card";
import AuthLayout from "@/components/auth-layout";

export default function Page() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, email, password }),
      });

      if (res.status === 201) {
        toast.success(
          "Company account created. Redirecting to company page...",
        );
        // short delay so user sees the toast
        setTimeout(() => {
          // send them to the admin/company landing page — they'll be prompted to sign in if unauthenticated
          router.push("/admin");
        }, 1400);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        toast.error(
          data?.message || "An account with that email already exists.",
        );
        setError("Email already in use");
        return;
      }

      if (!res.ok) {
        toast.error(
          data?.message || "Failed to create account. Please check your input.",
        );
        setError(data?.message || "Failed to create account");
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create account. Try again later.");
      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create company account"
      description="Set up your company and admin user to access the dashboard"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="company">Company (Tenant) Name</Label>
          <Input
            id="company"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Admin Email</Label>
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

        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <CardFooter className="flex items-center justify-between px-0">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
          <Link href="/auth/login" className="text-sm text-primary underline">
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </AuthLayout>
  );
}
