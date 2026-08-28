import { createInsertSchema } from "drizzle-zod";
import { boolean, jsonb, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const projectsTable = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  finishedWidth: numeric("finished_width").notNull(),
  finishedHeight: numeric("finished_height").notNull(),
  seamAllowance: numeric("seam_allowance").notNull(),
  unit: text("unit").notNull(),
  quiltType: text("quilt_type").notNull(),
  layoutJson: jsonb("layout_json").$type<Record<string, unknown>>().notNull(),
  aiPrompt: text("ai_prompt"),
  sourcePhotoUrl: text("source_photo_url"),
  reverseEngineered: boolean("reverse_engineered").notNull().default(false),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable);
export type InsertProject = typeof projectsTable.$inferInsert;
export type Project = typeof projectsTable.$inferSelect;