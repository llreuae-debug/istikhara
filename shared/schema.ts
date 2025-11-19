import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Verse Analysis Schema
export const verseAnalysisSchema = z.object({
  arabicText: z.string(),
  transliteration: z.string().optional(),
  urduInterpretation: z.object({
    literalMeaning: z.string(),
    background: z.string(),
    spiritualMessage: z.string(),
  }),
  surahName: z.string().optional(),
  verseNumber: z.string().optional(),
  timestamp: z.string().optional(),
});

export type VerseAnalysis = z.infer<typeof verseAnalysisSchema>;

export const analyzeVerseRequestSchema = z.object({
  imageBase64: z.string(),
});

export type AnalyzeVerseRequest = z.infer<typeof analyzeVerseRequestSchema>;
