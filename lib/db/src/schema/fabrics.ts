import { createInsertSchema } from "drizzle-zod";
import { boolean, jsonb, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const fabricsTable = pgTable("fabrics", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  imageUrl: text("image_url"),
  widthOfFabric: numeric("width_of_fabric").notNull(),
  amountOnHand: numeric("amount_on_hand").notNull(),
  amountUnit: text("amount_unit").notNull(),
  directional: boolean("directional").notNull().default(false),
  scaleKnown: boolean("scale_known").notNull().default(false),
  patternTags: jsonb("pattern_tags").$type<string[]>().notNull().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFabricSchema = createInsertSchema(fabricsTable);
export type InsertFabric = typeof fabricsTable.$inferInsert;
export type Fabric = typeof fabricsTable.$inferSelect;