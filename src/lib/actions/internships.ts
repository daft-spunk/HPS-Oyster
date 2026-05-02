"use server";

import { db } from "@/lib/db";
import {
  internshipSessions,
  companies,
  sessionCompanies,
  internshipRegistrations,
} from "@/lib/db/schema";
import {
  internshipRegistrationSchema,
  internshipSessionSchema,
  addCompanyToSessionSchema,
  updateSessionCompanySchema,
} from "@/lib/validators";
import { isAuthenticated } from "@/lib/auth";
import { eq, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ─── PUBLIC ─────────────────────────────────────────────

export async function getActiveInternshipSession() {
  try {
    const [session] = await db
      .select()
      .from(internshipSessions)
      .where(eq(internshipSessions.isActive, true));
    return session || null;
  } catch {
    return null;
  }
}

export async function getActiveInternshipSessions() {
  try {
    return await db
      .select()
      .from(internshipSessions)
      .where(eq(internshipSessions.isActive, true));
  } catch {
    return [];
  }
}

export async function getActiveInternshipSessionByClass(targetClass: "9" | "10") {
  try {
    const [session] = await db
      .select()
      .from(internshipSessions)
      .where(
        sql`${internshipSessions.isActive} = true AND ${internshipSessions.targetClass} IN (${targetClass}, '9_10')`
      );
    return session || null;
  } catch {
    return null;
  }
}

export async function getInternshipSessionWithCompanies(sessionId: string) {
  const [session] = await db
    .select()
    .from(internshipSessions)
    .where(eq(internshipSessions.id, sessionId));
  if (!session) return null;

  const linked = await db
    .select({
      sessionCompanyId: sessionCompanies.id,
      companyId: companies.id,
      name: companies.name,
      sector: companies.sector,
      description: companies.description,
      websiteUrl: companies.websiteUrl,
      internshipDate: sessionCompanies.internshipDate,
      slotsAvailable: sessionCompanies.slotsAvailable,
      displayOrder: sessionCompanies.displayOrder,
      aboutInternship: sessionCompanies.aboutInternship,
      whoFor: sessionCompanies.whoFor,
      whatToExpect: sessionCompanies.whatToExpect,
      whatToBring: sessionCompanies.whatToBring,
    })
    .from(sessionCompanies)
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(eq(sessionCompanies.sessionId, sessionId))
    .orderBy(sessionCompanies.displayOrder);

  return { ...session, companies: linked };
}

export async function registerForInternship(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const parsed = internshipRegistrationSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const [session] = await db
    .select()
    .from(internshipSessions)
    .where(eq(internshipSessions.id, data.sessionId));

  if (!session || !session.isActive) return { error: "This session is not active" };
  if (!session.regOpen) return { error: "Registration is closed" };
  if (session.regDeadline && new Date(session.regDeadline) < new Date()) {
    return { error: "Registration deadline has passed" };
  }

  // Verify each provided session-company ID belongs to this session
  const providedIds = [
    data.pref1SessionCompanyId,
    data.pref2SessionCompanyId,
    data.pref3SessionCompanyId,
  ].filter((v): v is string => Boolean(v));
  const valid = await db
    .select({ id: sessionCompanies.id })
    .from(sessionCompanies)
    .where(eq(sessionCompanies.sessionId, data.sessionId));
  const validSet = new Set(valid.map((v) => v.id));
  for (const id of providedIds) {
    if (!validSet.has(id)) return { error: "Invalid company selection" };
  }

  // Enforce per-session max-preferences cap (extra prefs above the limit are dropped)
  const max = session.maxPreferences ?? 3;
  const pref2Id = max >= 2 ? data.pref2SessionCompanyId ?? null : null;
  const pref2Reason = max >= 2 ? data.pref2Reason ?? null : null;
  const pref3Id = max >= 3 ? data.pref3SessionCompanyId ?? null : null;
  const pref3Reason = max >= 3 ? data.pref3Reason ?? null : null;

  try {
    await db.insert(internshipRegistrations).values({
      sessionId: data.sessionId,
      studentName: data.studentName,
      classSection: data.classSection,
      rollNumber: data.rollNumber,
      parentName: data.parentName,
      parentEmail: data.parentEmail,
      parentPhone: data.parentPhone,
      interests: data.interests || null,
      pref1SessionCompanyId: data.pref1SessionCompanyId,
      pref1Reason: data.pref1Reason,
      pref2SessionCompanyId: pref2Id,
      pref2Reason: pref2Reason,
      pref3SessionCompanyId: pref3Id,
      pref3Reason: pref3Reason,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.message} ${(e as { cause?: Error }).cause?.message ?? ""}` : "";
    if (msg.includes("unique_internship_reg")) {
      return { error: "You have already registered for this session" };
    }
    throw e;
  }

  revalidatePath("/internships");
  revalidatePath("/admin");
  revalidatePath("/admin/internship-sessions");
  revalidatePath(`/admin/internship-sessions/${data.sessionId}`);
  revalidatePath(`/admin/internship-sessions/${data.sessionId}/registrations`);
  return { success: true };
}

// ─── ADMIN ──────────────────────────────────────────────

export async function getAllInternshipSessions() {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  return db
    .select({
      id: internshipSessions.id,
      title: internshipSessions.title,
      editionLabel: internshipSessions.editionLabel,
      targetClass: internshipSessions.targetClass,
      maxPreferences: internshipSessions.maxPreferences,
      description: internshipSessions.description,
      isActive: internshipSessions.isActive,
      regOpen: internshipSessions.regOpen,
      regDeadline: internshipSessions.regDeadline,
      createdAt: internshipSessions.createdAt,
      companyCount: sql<number>`(SELECT COUNT(*) FROM session_companies WHERE session_companies.session_id = ${sql.raw('"internship_sessions"."id"')})`.as("company_count"),
      registrationCount: sql<number>`(SELECT COUNT(*) FROM internship_registrations WHERE internship_registrations.session_id = ${sql.raw('"internship_sessions"."id"')})`.as("registration_count"),
    })
    .from(internshipSessions)
    .orderBy(desc(internshipSessions.createdAt));
}

export async function createInternshipSession(
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = internshipSessionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [created] = await db
    .insert(internshipSessions)
    .values({
      title: parsed.data.title,
      editionLabel: parsed.data.editionLabel,
      targetClass: parsed.data.targetClass,
      maxPreferences: parsed.data.maxPreferences,
      description: parsed.data.description || null,
      regDeadline: parsed.data.regDeadline ? new Date(parsed.data.regDeadline) : null,
    })
    .returning({ id: internshipSessions.id });

  revalidatePath("/admin/internship-sessions");
  return { success: true, id: created.id };
}

export async function updateInternshipSession(
  sessionId: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = internshipSessionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(internshipSessions)
    .set({
      title: parsed.data.title,
      editionLabel: parsed.data.editionLabel,
      targetClass: parsed.data.targetClass,
      maxPreferences: parsed.data.maxPreferences,
      description: parsed.data.description || null,
      regDeadline: parsed.data.regDeadline ? new Date(parsed.data.regDeadline) : null,
      updatedAt: new Date(),
    })
    .where(eq(internshipSessions.id, sessionId));

  revalidatePath("/admin/internship-sessions");
  revalidatePath("/internships");
  revalidatePath("/");
  return { success: true };
}

export async function toggleInternshipActive(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const [s] = await db.select().from(internshipSessions).where(eq(internshipSessions.id, sessionId));
  if (!s) throw new Error("Not found");

  if (s.isActive) {
    await db.update(internshipSessions).set({ isActive: false, updatedAt: new Date() }).where(eq(internshipSessions.id, sessionId));
  } else {
    await db
      .update(internshipSessions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(internshipSessions.targetClass, s.targetClass), eq(internshipSessions.isActive, true)));
    await db.update(internshipSessions).set({ isActive: true, updatedAt: new Date() }).where(eq(internshipSessions.id, sessionId));
  }

  revalidatePath("/admin/internship-sessions");
  revalidatePath("/internships");
  revalidatePath("/");
}

export async function toggleInternshipRegOpen(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const [s] = await db.select().from(internshipSessions).where(eq(internshipSessions.id, sessionId));
  if (!s) throw new Error("Not found");
  await db
    .update(internshipSessions)
    .set({ regOpen: !s.regOpen, updatedAt: new Date() })
    .where(eq(internshipSessions.id, sessionId));
  revalidatePath("/admin/internship-sessions");
  revalidatePath("/internships");
}

export async function deleteInternshipSession(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  await db.delete(internshipSessions).where(eq(internshipSessions.id, sessionId));
  revalidatePath("/admin/internship-sessions");
  revalidatePath("/internships");
  revalidatePath("/");
}

// Linking companies to sessions
export async function addCompanyToSession(
  sessionId: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = addCompanyToSessionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await db.insert(sessionCompanies).values({
      sessionId,
      companyId: parsed.data.companyId,
      internshipDate: parsed.data.internshipDate || null,
      slotsAvailable: parsed.data.slotsAvailable,
      displayOrder: parsed.data.displayOrder,
      aboutInternship: parsed.data.aboutInternship || null,
      whoFor: parsed.data.whoFor || null,
      whatToExpect: parsed.data.whatToExpect || null,
      whatToBring: parsed.data.whatToBring || null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.message} ${(e as { cause?: Error }).cause?.message ?? ""}` : "";
    if (msg.includes("unique_company_per_session")) {
      return { error: "This company is already added to this session" };
    }
    throw e;
  }

  revalidatePath(`/admin/internship-sessions/${sessionId}`);
  revalidatePath("/internships");
  return { success: true };
}

export async function updateSessionCompany(
  sessionCompanyId: string,
  sessionId: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = updateSessionCompanySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(sessionCompanies)
    .set({
      internshipDate: parsed.data.internshipDate || null,
      slotsAvailable: parsed.data.slotsAvailable,
      displayOrder: parsed.data.displayOrder,
      aboutInternship: parsed.data.aboutInternship || null,
      whoFor: parsed.data.whoFor || null,
      whatToExpect: parsed.data.whatToExpect || null,
      whatToBring: parsed.data.whatToBring || null,
    })
    .where(eq(sessionCompanies.id, sessionCompanyId));

  revalidatePath(`/admin/internship-sessions/${sessionId}`);
  revalidatePath("/internships");
  return { success: true };
}

export async function deleteInternshipRegistration(registrationId: string, sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  await db.delete(internshipRegistrations).where(eq(internshipRegistrations.id, registrationId));
  revalidatePath(`/admin/internship-sessions/${sessionId}/registrations`);
  revalidatePath(`/admin/internship-sessions/${sessionId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/internship-sessions");
  revalidatePath("/internships");
}

export async function removeCompanyFromSession(sessionCompanyId: string, sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  await db.delete(sessionCompanies).where(eq(sessionCompanies.id, sessionCompanyId));
  revalidatePath(`/admin/internship-sessions/${sessionId}`);
  revalidatePath("/internships");
}

export async function getInternshipRegistrations(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  return db
    .select({
      id: internshipRegistrations.id,
      studentName: internshipRegistrations.studentName,
      classSection: internshipRegistrations.classSection,
      rollNumber: internshipRegistrations.rollNumber,
      parentName: internshipRegistrations.parentName,
      parentEmail: internshipRegistrations.parentEmail,
      parentPhone: internshipRegistrations.parentPhone,
      interests: internshipRegistrations.interests,
      pref1Reason: internshipRegistrations.pref1Reason,
      pref2Reason: internshipRegistrations.pref2Reason,
      pref3Reason: internshipRegistrations.pref3Reason,
      pref1Company: sql<string>`(SELECT c.name FROM session_companies sc JOIN companies c ON c.id = sc.company_id WHERE sc.id = ${internshipRegistrations.pref1SessionCompanyId})`,
      pref2Company: sql<string>`(SELECT c.name FROM session_companies sc JOIN companies c ON c.id = sc.company_id WHERE sc.id = ${internshipRegistrations.pref2SessionCompanyId})`,
      pref3Company: sql<string>`(SELECT c.name FROM session_companies sc JOIN companies c ON c.id = sc.company_id WHERE sc.id = ${internshipRegistrations.pref3SessionCompanyId})`,
      createdAt: internshipRegistrations.createdAt,
    })
    .from(internshipRegistrations)
    .where(eq(internshipRegistrations.sessionId, sessionId))
    .orderBy(internshipRegistrations.createdAt);
}
