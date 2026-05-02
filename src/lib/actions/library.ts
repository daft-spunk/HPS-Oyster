"use server";

import { db } from "@/lib/db";
import { speakers, companies, sessionSpeakers, sessionCompanies, talkSessions, internshipSessions } from "@/lib/db/schema";
import { speakerSchema, companySchema } from "@/lib/validators";
import { isAuthenticated } from "@/lib/auth";
import { eq, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ─── SPEAKERS LIBRARY ───────────────────────────────────

export async function getAllSpeakers() {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  return db
    .select({
      id: speakers.id,
      name: speakers.name,
      bio: speakers.bio,
      batchYear: speakers.batchYear,
      house: speakers.house,
      photoUrl: speakers.photoUrl,
      linkedinUrl: speakers.linkedinUrl,
      defaultSlotLimit: speakers.defaultSlotLimit,
      notes: speakers.notes,
      timesUsed: sql<number>`(SELECT COUNT(*) FROM session_speakers WHERE session_speakers.speaker_id = ${sql.raw('"speakers"."id"')})`.as("times_used"),
      lastUsedAt: sql<Date | null>`(
        SELECT MAX(${sql.raw('"talk_sessions"."session_date"')}) FROM session_speakers
        JOIN ${sql.raw('"talk_sessions"')} ON ${sql.raw('"talk_sessions"."id"')} = session_speakers.session_id
        WHERE session_speakers.speaker_id = ${sql.raw('"speakers"."id"')}
      )`.as("last_used_at"),
    })
    .from(speakers)
    .orderBy(desc(speakers.updatedAt));
}

export async function getSpeaker(id: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const [speaker] = await db.select().from(speakers).where(eq(speakers.id, id));
  return speaker || null;
}

export async function createSpeaker(
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = speakerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(speakers).values({
    ...parsed.data,
    photoUrl: parsed.data.photoUrl || null,
    linkedinUrl: parsed.data.linkedinUrl || null,
    batchYear: parsed.data.batchYear || null,
    house: parsed.data.house || null,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/admin/library/speakers");
  return { success: true };
}

export async function updateSpeaker(
  id: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = speakerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(speakers)
    .set({
      ...parsed.data,
      photoUrl: parsed.data.photoUrl || null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      batchYear: parsed.data.batchYear || null,
      house: parsed.data.house || null,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(speakers.id, id));

  revalidatePath("/admin/library/speakers");
  revalidatePath("/talks");
  return { success: true };
}

export async function deleteSpeaker(id: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  try {
    await db.delete(speakers).where(eq(speakers.id, id));
  } catch {
    throw new Error("Cannot delete: speaker is used in one or more sessions");
  }
  revalidatePath("/admin/library/speakers");
}

// ─── COMPANIES LIBRARY ──────────────────────────────────

export async function getAllCompanies() {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  return db
    .select({
      id: companies.id,
      name: companies.name,
      sector: companies.sector,
      description: companies.description,
      contactName: companies.contactName,
      contactEmail: companies.contactEmail,
      defaultSlotLimit: companies.defaultSlotLimit,
      notes: companies.notes,
      timesUsed: sql<number>`(SELECT COUNT(*) FROM session_companies WHERE session_companies.company_id = ${sql.raw('"companies"."id"')})`.as("times_used"),
      lastUsedTitle: sql<string | null>`(
        SELECT ${sql.raw('"internship_sessions"."title"')} FROM session_companies
        JOIN ${sql.raw('"internship_sessions"')} ON ${sql.raw('"internship_sessions"."id"')} = session_companies.session_id
        WHERE session_companies.company_id = ${sql.raw('"companies"."id"')}
        ORDER BY ${sql.raw('"internship_sessions"."created_at"')} DESC LIMIT 1
      )`.as("last_used_title"),
    })
    .from(companies)
    .orderBy(desc(companies.updatedAt));
}

export async function getCompany(id: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const [company] = await db.select().from(companies).where(eq(companies.id, id));
  return company || null;
}

export async function createCompany(
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = companySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(companies).values({
    ...parsed.data,
    contactName: parsed.data.contactName || null,
    contactEmail: parsed.data.contactEmail || null,
    websiteUrl: parsed.data.websiteUrl || null,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/admin/library/companies");
  return { success: true };
}

export async function updateCompany(
  id: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = companySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(companies)
    .set({
      ...parsed.data,
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      websiteUrl: parsed.data.websiteUrl || null,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, id));

  revalidatePath("/admin/library/companies");
  revalidatePath("/internships");
  return { success: true };
}

export async function deleteCompany(id: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  try {
    await db.delete(companies).where(eq(companies.id, id));
  } catch {
    throw new Error("Cannot delete: company is used in one or more sessions");
  }
  revalidatePath("/admin/library/companies");
}
