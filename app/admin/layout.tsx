import type { ReactNode } from "react";

import { requireActiveTenant } from "@/lib/tenant-auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireActiveTenant();
  return <>{children}</>;
}
