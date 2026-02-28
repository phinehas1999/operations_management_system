"use client";

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function AuthLayout({ title, description, children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </CardHeader>

          <CardContent>{children}</CardContent>
        </Card>
        <Toaster />
      </div>
    </div>
  );
}
