import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";

import { tenants, users, roleEnum } from "./schema";

// Teams within a tenant (used by admin UI)
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  // optional manager assigned to the team
  managerId: uuid("manager_id")
    .references(() => users.id)
    .$type<string | null>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Many-to-many user <> team
export const userTeams = pgTable(
  "user_teams",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    // role of the user within the team (e.g. 'MANAGER' | 'STAFF')
    role: text("role").default("STAFF").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.teamId] }),
  }),
);

// Tasks assigned to users inside a tenant
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: uuid("assignee_id")
    .references(() => users.id, { onDelete: "set null" })
    .$type<string | null>(),
  assigneeTeamId: uuid("assignee_team_id")
    .references(() => teams.id, { onDelete: "set null" })
    .$type<string | null>(),
  assigneeType: text("assignee_type").default("UNASSIGNED").notNull(),
  status: text("status").default("pending").notNull(),
  priority: text("priority").default("medium").notNull(),
  meta: jsonb("meta")
    .$type<Record<string, unknown>>()
    .default(sql`'{}'::jsonb`)
    .notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "set null" })
    .$type<string | null>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

// Audit logs for admin actions
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .$type<string | null>(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "set null" })
    .$type<string | null>(),
  action: text("action").notNull(),
  meta: jsonb("meta")
    .$type<Record<string, unknown>>()
    .default(sql`'{}'::jsonb`)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations
export const teamsRelations = relations(teams, ({ many, one }) => ({
  users: many(userTeams),
  tenant: one(tenants, { fields: [teams.tenantId], references: [tenants.id] }),
}));

export const userTeamsRelations = relations(userTeams, ({ one }) => ({
  user: one(users, { fields: [userTeams.userId], references: [users.id] }),
  team: one(teams, { fields: [userTeams.teamId], references: [teams.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  tenant: one(tenants, { fields: [tasks.tenantId], references: [tenants.id] }),
  assignee: one(users, { fields: [tasks.assigneeId], references: [users.id] }),
  assigneeTeam: one(teams, {
    fields: [tasks.assigneeTeamId],
    references: [teams.id],
  }),
  creator: one(users, { fields: [tasks.createdBy], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export type Team = typeof teams.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
