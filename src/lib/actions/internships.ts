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
import { istLocalInputToUtc, anyDateOpen } from "@/lib/format";

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
      internshipDates: sessionCompanies.internshipDates,
      slotsAvailable: sessionCompanies.slotsAvailable,
      displayOrder: sessionCompanies.displayOrder,
      aboutInternship: sessionCompanies.aboutInternship,
      whoFor: sessionCompanies.whoFor,
      whatToExpect: sessionCompanies.whatToExpect,
      whatToBring: sessionCompanies.whatToBring,
      isActive: sessionCompanies.isActive,
      registrationCount: sql<number>`(
        SELECT COUNT(*) FROM internship_registrations ir
        WHERE ir.session_id = ${sql.raw('"session_companies"."session_id"')}
          AND (
            ir.pref_1_session_company_id = ${sql.raw('"session_companies"."id"')} OR
            ir.pref_2_session_company_id = ${sql.raw('"session_companies"."id"')} OR
            ir.pref_3_session_company_id = ${sql.raw('"session_companies"."id"')}
          )
      )`.as("registration_count"),
      pref1Count: sql<number>`(
        SELECT COUNT(*) FROM internship_registrations ir
        WHERE ir.session_id = ${sql.raw('"session_companies"."session_id"')}
          AND ir.pref_1_session_company_id = ${sql.raw('"session_companies"."id"')}
      )`.as("pref1_count"),
      pref2Count: sql<number>`(
        SELECT COUNT(*) FROM internship_registrations ir
        WHERE ir.session_id = ${sql.raw('"session_companies"."session_id"')}
          AND ir.pref_2_session_company_id = ${sql.raw('"session_companies"."id"')}
      )`.as("pref2_count"),
      pref3Count: sql<number>`(
        SELECT COUNT(*) FROM internship_registrations ir
        WHERE ir.session_id = ${sql.raw('"session_companies"."session_id"')}
          AND ir.pref_3_session_company_id = ${sql.raw('"session_companies"."id"')}
      )`.as("pref3_count"),
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

  // Verify each provided session-company belongs to this session, is active,
  // and still has at least one date that hasn't hit the cutoff.
  const providedIds = [
    data.pref1SessionCompanyId,
    data.pref2SessionCompanyId,
    data.pref3SessionCompanyId,
  ].filter((v): v is string => Boolean(v));
  const valid = await db
    .select({
      id: sessionCompanies.id,
      name: companies.name,
      isActive: sessionCompanies.isActive,
      internshipDates: sessionCompanies.internshipDates,
    })
    .from(sessionCompanies)
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(eq(sessionCompanies.sessionId, data.sessionId));
  const validMap = new Map(valid.map((v) => [v.id, v]));
  const cutoff = session.registrationCutoffDays ?? 2;
  for (const id of providedIds) {
    const sc = validMap.get(id);
    if (!sc) return { error: "Invalid company selection" };
    if (!sc.isActive) {
      return { error: `${sc.name} is no longer accepting registrations` };
    }
    if (!anyDateOpen(sc.internshipDates, cutoff)) {
      return {
        error: `Registration for ${sc.name} has closed (must apply at least ${cutoff} day${cutoff === 1 ? "" : "s"} before the internship date)`,
      };
    }
  }

  // Enforce per-session max-preferences cap (extra prefs above the limit are dropped)
  const max = session.maxPreferences ?? 3;
  const pref2Id = max >= 2 ? data.pref2SessionCompanyId ?? null : null;
  const pref2Reason = max >= 2 ? data.pref2Reason ?? null : null;
  const pref3Id = max >= 3 ? data.pref3SessionCompanyId ?? null : null;
  const pref3Reason = max >= 3 ? data.pref3Reason ?? null : null;

  // App-level uniqueness check: same (session, class, roll) cannot register twice
  // through the public form. Admin imports/manual entries are allowed to
  // create multiple rows for the same student (different submissions over time).
  const [existing] = await db
    .select({ id: internshipRegistrations.id })
    .from(internshipRegistrations)
    .where(
      sql`${internshipRegistrations.sessionId} = ${data.sessionId}
        AND ${internshipRegistrations.classSection} = ${data.classSection}
        AND ${internshipRegistrations.rollNumber} = ${data.rollNumber}`
    )
    .limit(1);
  if (existing) {
    return { error: "You have already registered for this session" };
  }

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
      registrationCutoffDays: parsed.data.registrationCutoffDays,
      description: parsed.data.description || null,
      regDeadline: istLocalInputToUtc(parsed.data.regDeadline ?? null),
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
      registrationCutoffDays: parsed.data.registrationCutoffDays,
      description: parsed.data.description || null,
      regDeadline: istLocalInputToUtc(parsed.data.regDeadline ?? null),
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
      internshipDates: parsed.data.internshipDates ?? null,
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
      internshipDates: parsed.data.internshipDates ?? null,
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

export async function toggleSessionCompanyActive(sessionCompanyId: string, sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const [row] = await db
    .select({ isActive: sessionCompanies.isActive })
    .from(sessionCompanies)
    .where(eq(sessionCompanies.id, sessionCompanyId));
  if (!row) throw new Error("Not found");
  await db
    .update(sessionCompanies)
    .set({ isActive: !row.isActive })
    .where(eq(sessionCompanies.id, sessionCompanyId));
  revalidatePath(`/admin/internship-sessions/${sessionId}`);
  revalidatePath("/internships");
}

export async function getInternshipRegistration(registrationId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const [row] = await db
    .select()
    .from(internshipRegistrations)
    .where(eq(internshipRegistrations.id, registrationId));
  return row || null;
}

export async function updateInternshipRegistration(
  registrationId: string,
  sessionId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  try {
    const get = (k: string) => (formData.get(k) as string | null)?.trim() || "";
    const collect = (i: number) => {
      const id = get(`pref${i}SessionCompanyId`);
      const reason = get(`pref${i}Reason`);
      return { id: id || null, reason: reason || null };
    };
    const p1 = collect(1);
    const p2 = collect(2);
    const p3 = collect(3);
    if (!p1.id || !p1.reason) {
      return { error: "First preference (with reason) is required" };
    }

    await db
      .update(internshipRegistrations)
      .set({
        studentName: get("studentName"),
        classSection: get("classSection"),
        rollNumber: get("rollNumber"),
        parentName: get("parentName"),
        parentEmail: get("parentEmail"),
        parentPhone: get("parentPhone"),
        interests: get("interests") || null,
        pref1SessionCompanyId: p1.id,
        pref1Reason: p1.reason,
        pref2SessionCompanyId: p2.id,
        pref2Reason: p2.reason,
        pref3SessionCompanyId: p3.id,
        pref3Reason: p3.reason,
      })
      .where(eq(internshipRegistrations.id, registrationId));

    revalidatePath(`/admin/internship-sessions/${sessionId}`);
    revalidatePath(`/admin/internship-sessions/${sessionId}/registrations`);
    revalidatePath("/admin");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.message} ${(e as { cause?: Error }).cause?.message ?? ""}` : "";
    if (msg.includes("unique_internship_reg")) {
      return { error: "Another registration with the same class + roll number already exists" };
    }
    return { error: e instanceof Error ? e.message : "Failed to update registration" };
  }
}

// ─── ADMIN: MANUAL REGISTRATION ENTRY ──────────────────────────────────

interface ManualPref {
  sessionCompanyId: string | null;
  reason: string | null;
}

interface ManualRegistrationInput {
  sessionId: string;
  studentName: string;
  classSection: string;
  rollNumber: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  interests?: string | null;
  prefs: ManualPref[]; // 1..3
  createdAt?: Date | null;
}

async function insertOneRegistration(input: ManualRegistrationInput) {
  const prefs = input.prefs;
  const p1 = prefs[0];
  if (!p1?.sessionCompanyId || !p1.reason) {
    throw new Error(`Roll ${input.rollNumber}: at least one preference (with reason) required`);
  }
  await db.insert(internshipRegistrations).values({
    sessionId: input.sessionId,
    studentName: input.studentName,
    classSection: input.classSection,
    rollNumber: input.rollNumber,
    parentName: input.parentName,
    parentEmail: input.parentEmail,
    parentPhone: input.parentPhone,
    interests: input.interests || null,
    pref1SessionCompanyId: p1.sessionCompanyId,
    pref1Reason: p1.reason,
    pref2SessionCompanyId: prefs[1]?.sessionCompanyId || null,
    pref2Reason: prefs[1]?.reason || null,
    pref3SessionCompanyId: prefs[2]?.sessionCompanyId || null,
    pref3Reason: prefs[2]?.reason || null,
    ...(input.createdAt ? { createdAt: input.createdAt } : {}),
  });
}

export async function manuallyAddInternshipRegistration(
  sessionId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  try {
    const get = (k: string) => (formData.get(k) as string | null)?.trim() || "";
    const collect = (i: number): ManualPref => {
      const id = get(`pref${i}SessionCompanyId`);
      const reason = get(`pref${i}Reason`);
      return { sessionCompanyId: id || null, reason: reason || null };
    };

    await insertOneRegistration({
      sessionId,
      studentName: get("studentName"),
      classSection: get("classSection"),
      rollNumber: get("rollNumber"),
      parentName: get("parentName"),
      parentEmail: get("parentEmail"),
      parentPhone: get("parentPhone"),
      interests: get("interests") || null,
      prefs: [collect(1), collect(2), collect(3)],
      createdAt: get("registeredAt") ? new Date(get("registeredAt")) : null,
    });

    revalidatePath(`/admin/internship-sessions/${sessionId}`);
    revalidatePath(`/admin/internship-sessions/${sessionId}/registrations`);
    revalidatePath("/admin");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.message} ${(e as { cause?: Error }).cause?.message ?? ""}` : "";
    if (msg.includes("unique_internship_reg")) {
      return { error: "A registration with that roll number already exists" };
    }
    return { error: e instanceof Error ? e.message : "Failed to add registration" };
  }
}

// Parse CSV rows in the legacy hpsoyster.com export format and map to
// session_company IDs by fuzzy-matching the company name at the start of
// each "Internship N" column.
function parseLegacyCsv(text: string): Array<Record<string, string>> {
  // Simple, RFC-4180-ish CSV parser that handles quoted fields with commas/newlines/escaped quotes.
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        if (row.some((c) => c.length > 0)) rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.length > 0)) rows.push(row);
  }

  // Find header row — first row containing "Roll Number" or similar
  let headerIdx = rows.findIndex((r) => r.some((c) => /Roll\s*Number/i.test(c)));
  if (headerIdx < 0) headerIdx = 0;
  const headers = rows[headerIdx].map((h) => h.trim());
  return rows.slice(headerIdx + 1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] || "").trim();
    });
    return obj;
  });
}

export async function bulkUploadInternshipRegistrations(
  sessionId: string,
  _prev: { errors?: string[]; imported?: number } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");

  const file = formData.get("csv");
  if (!(file instanceof File) || file.size === 0) {
    return { errors: ["Please choose a CSV file to upload"] };
  }
  const skipDuplicates = formData.get("skipDuplicates") === "on";

  const text = await file.text();
  const rows = parseLegacyCsv(text);

  // Build a lookup of session_company by lowercased company name
  const sessionCompaniesList = await db
    .select({
      id: sessionCompanies.id,
      name: companies.name,
    })
    .from(sessionCompanies)
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(eq(sessionCompanies.sessionId, sessionId));
  const byName = new Map<string, string>();
  for (const sc of sessionCompaniesList) {
    byName.set(sc.name.toLowerCase().trim(), sc.id);
  }

  const lookup = (cell: string): { id: string | null; reason: string | null } => {
    if (!cell || cell.trim() === "") return { id: null, reason: null };
    // Format: "<Company Name>, <Date label> - <Reason>"
    const dashIdx = cell.indexOf(" - ");
    const head = (dashIdx > 0 ? cell.slice(0, dashIdx) : cell).trim();
    const reason = dashIdx > 0 ? cell.slice(dashIdx + 3).trim() : "";
    // Take everything before the first comma as the company name (rest is the date label)
    const companyName = head.split(",")[0].trim().toLowerCase();
    let id: string | null = null;
    for (const [k, v] of byName) {
      if (k === companyName || k.startsWith(companyName) || companyName.startsWith(k)) {
        id = v;
        break;
      }
    }
    return { id, reason: reason || null };
  };

  const errors: string[] = [];
  let imported = 0;
  let skippedDuplicates = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const studentName = r["Name of the Student"] || r["Student Name"] || "";
    const rollNumber = r["Roll Number"] || "";
    if (!studentName || !rollNumber) {
      errors.push(`Row ${i + 2}: missing student name or roll number — skipped`);
      continue;
    }
    const dateRaw = r["Date"] || "";
    const createdAt = dateRaw ? new Date(dateRaw.replace(" ", "T")) : null;

    const p1 = lookup(r["Internship 1"] || "");
    const p2 = lookup(r["Internship 2"] || "");
    const p3 = lookup(r["Internship 3"] || "");

    if (!p1.id || !p1.reason) {
      errors.push(
        `Row ${i + 2} (${studentName}, roll ${rollNumber}): no valid first preference found — skipped`
      );
      continue;
    }

    try {
      await insertOneRegistration({
        sessionId,
        studentName,
        classSection: r["Class/Section"] || "",
        rollNumber,
        parentName: r["Parent Name"] || "",
        parentEmail: r["Parent Email Id"] || r["Parent Email"] || "",
        parentPhone: r["Parent Phone Number"] || r["Parent Phone"] || "",
        interests: r["Child s general interests"] || r["Interests"] || null,
        prefs: [p1, p2, p3].map((p) => ({ sessionCompanyId: p.id, reason: p.reason })),
        createdAt: createdAt && !isNaN(createdAt.getTime()) ? createdAt : null,
      });
      imported++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? `${e.message} ${(e as { cause?: Error }).cause?.message ?? ""}` : "";
      if (msg.includes("unique_internship_reg")) {
        if (skipDuplicates) {
          skippedDuplicates++;
        } else {
          errors.push(`Row ${i + 2} (${studentName}, roll ${rollNumber}): already exists — check "skip duplicates" to ignore`);
        }
      } else {
        errors.push(`Row ${i + 2} (${studentName}): ${e instanceof Error ? e.message : "insert failed"}`);
      }
    }
  }

  if (skippedDuplicates > 0) {
    errors.unshift(`${skippedDuplicates} duplicate row(s) skipped`);
  }

  revalidatePath(`/admin/internship-sessions/${sessionId}`);
  revalidatePath(`/admin/internship-sessions/${sessionId}/registrations`);
  revalidatePath("/admin");

  return { imported, errors };
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
    .orderBy(desc(internshipRegistrations.createdAt));
}
