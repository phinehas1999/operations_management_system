import NextAuth from "next-auth";
import { Role } from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: Role;
      tenantId?: string | null;
      isSuperAdmin?: boolean;
    };
  }

  interface User {
    role?: Role;
    tenantId?: string | null;
    isSuperAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    tenantId?: string | null;
    isSuperAdmin?: boolean;
  }
}
