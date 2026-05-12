"use server";

import { db } from "@/lib/db";
import {
  internshipRegistrations,
  internshipSessions,
  internshipFeedbackCompany,
  internshipFeedbackSession,
  sessionCompanies,
  companies,
} from "@/lib/db/schema";
import {
  feedbackLookupSchema,
  feedbackSubmitSchema,
  feedbackCompanyEntrySchema,
} from "@/lib/validators";
import { isInternshipOver } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import { eq, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Types returned to the public form ────────────────────────────────────

export type FeedbackPhase =
  | { phase: "lookup"; error?: string }
  | {
      phase: "fill";
      sessionId: string;
      registration: {
        id: string;
        studentName: string;
        classSection: string;
        rollNumber: string;
        parentName: string;
        parentEmail: string;
        parentPhone: string;
      };
      eligibleCompanies: Array<{
        sessionCompanyId: string;
        name: string;
        sector: string;
        internshipDates: string[] | null;
      }>;
      prefill: Record<string, z.infer<typeof feedbackCompanyEntrySchema>>;
      sessionPrefill: {
        organizationSatisfaction: string | null;
        encourageMore: string | null;
        likedAndBetter: string | null;
        suggestions: string | null;
      };
      error?: string;
    }
  | { phase: "done"; studentName: string };

// ─── PUBLIC: lookup registration + show portal ───────────────────────────

async function buildFillPhase(
  sessionId: string,
  registrationId: string,
  errorMsg?: string
): Promise<FeedbackPhase> {
  const [reg] = await db
    .select()
    .from(internshipRegistrations)
    .where(eq(internshipRegistrations.id, registrationId));
  if (!reg) return { phase: "lookup", error: "Registration not found" };

  const sessionCompaniesAll = await db
    .select({
      sessionCompanyId: sessionCompanies.id,
      name: companies.name,
      sector: companies.sector,
      internshipDates: sessionCompanies.internshipDates,
    })
    .from(sessionCompanies)
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(eq(sessionCompanies.sessionId, sessionId));

  const eligibleCompanies = sessionCompaniesAll
    .filter((c) => isInternshipOver(c.internshipDates ?? null))
    .map((c) => ({
      ...c,
      internshipDates: (c.internshipDates ?? null) as string[] | null,
    }));

  // Pull any prior feedback so the form is pre-filled if they're editing
  const existingPerCompany = await db
    .select()
    .from(internshipFeedbackCompany)
    .where(eq(internshipFeedbackCompany.registrationId, registrationId));
  const prefill: FeedbackPhase extends { phase: "fill"; prefill: infer P }
    ? P
    : Record<string, z.infer<typeof feedbackCompanyEntrySchema>> = {} as Record<
    string,
    z.infer<typeof feedbackCompanyEntrySchema>
  >;
  for (const row of existingPerCompany) {
    prefill[row.sessionCompanyId] = {
      sessionCompanyId: row.sessionCompanyId,
      internshipDate: row.internshipDate ?? undefined,
      interactivityRating: row.interactivityRating,
      speakerRating: row.speakerRating,
      keyTakeaway: row.keyTakeaway,
      viewChangeLevel: row.viewChangeLevel as never,
      learningValue: row.learningValue as never,
      subjectClarity: row.subjectClarity as never,
    };
  }

  const [existingSession] = await db
    .select()
    .from(internshipFeedbackSession)
    .where(eq(internshipFeedbackSession.registrationId, registrationId));

  return {
    phase: "fill",
    sessionId,
    registration: {
      id: reg.id,
      studentName: reg.studentName,
      classSection: reg.classSection,
      rollNumber: reg.rollNumber,
      parentName: reg.parentName,
      parentEmail: reg.parentEmail,
      parentPhone: reg.parentPhone,
    },
    eligibleCompanies,
    prefill,
    sessionPrefill: {
      organizationSatisfaction: existingSession?.organizationSatisfaction ?? null,
      encourageMore: existingSession?.encourageMore ?? null,
      likedAndBetter: existingSession?.likedAndBetter ?? null,
      suggestions: existingSession?.suggestions ?? null,
    },
    error: errorMsg,
  };
}

export async function feedbackEntry(
  _prev: FeedbackPhase | null,
  formData: FormData
): Promise<FeedbackPhase> {
  // Two stages share this action; differentiate by intent field.
  const intent = (formData.get("intent") as string | null) || "lookup";

  if (intent === "lookup") {
    const parsed = feedbackLookupSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { phase: "lookup", error: parsed.error.issues[0].message };
    }
    // Find a registration in this session that matches class + roll. There may
    // be multiple (we kept duplicates intentionally) — pick the latest.
    const matches = await db
      .select()
      .from(internshipRegistrations)
      .where(
        sql`${internshipRegistrations.sessionId} = ${parsed.data.sessionId}
          AND lower(${internshipRegistrations.classSection}) = lower(${parsed.data.classSection})
          AND lower(${internshipRegistrations.rollNumber}) = lower(${parsed.data.rollNumber})`
      );
    if (matches.length === 0) {
      return {
        phase: "lookup",
        error:
          "We couldn't find a registration with that class and roll number. Please double-check the details you used when registering.",
      };
    }
    const latest = matches.sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    )[0];
    return buildFillPhase(parsed.data.sessionId, latest.id);
  }

  if (intent === "submit") {
    // Re-parse the multi-row form
    const data = Object.fromEntries(formData.entries());
    const registrationId = (data.registrationId as string) || "";
    const sessionId = (data.sessionId as string) || "";

    // Re-read company IDs that the user ticked. We expect inputs like
    // ticked_<scId>=on, plus per-row fields prefixed by sc_<scId>_*
    const tickedIds: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("ticked_") && formData.get(key)) {
        tickedIds.push(key.replace("ticked_", ""));
      }
    }

    const perCompany = tickedIds.map((scId) => ({
      sessionCompanyId: scId,
      internshipDate: (formData.get(`sc_${scId}_date`) as string) || undefined,
      interactivityRating: Number(formData.get(`sc_${scId}_interactivity`) || 0),
      speakerRating: Number(formData.get(`sc_${scId}_speaker`) || 0),
      keyTakeaway: ((formData.get(`sc_${scId}_takeaway`) as string) || "").trim(),
      viewChangeLevel: formData.get(`sc_${scId}_viewChange`) as string,
      learningValue: formData.get(`sc_${scId}_learning`) as string,
      subjectClarity: formData.get(`sc_${scId}_clarity`) as string,
    }));

    const parsed = feedbackSubmitSchema.safeParse({
      registrationId,
      perCompany,
      organizationSatisfaction: data.organizationSatisfaction,
      encourageMore: data.encourageMore,
      likedAndBetter: ((data.likedAndBetter as string) || "").trim(),
      suggestions: ((data.suggestions as string) || "").trim(),
    });

    if (!parsed.success) {
      return buildFillPhase(sessionId, registrationId, parsed.error.issues[0].message);
    }

    // Validate every ticked company is actually past-date and belongs to this session
    const valid = await db
      .select({
        id: sessionCompanies.id,
        internshipDates: sessionCompanies.internshipDates,
        sessionId: sessionCompanies.sessionId,
      })
      .from(sessionCompanies)
      .where(inArray(sessionCompanies.id, parsed.data.perCompany.map((p) => p.sessionCompanyId)));
    const byId = new Map(valid.map((v) => [v.id, v]));
    for (const c of parsed.data.perCompany) {
      const v = byId.get(c.sessionCompanyId);
      if (!v || v.sessionId !== sessionId) {
        return buildFillPhase(sessionId, registrationId, "Invalid company selection");
      }
      if (!isInternshipOver(v.internshipDates)) {
        return buildFillPhase(
          sessionId,
          registrationId,
          "Feedback can only be given for internships that have already happened"
        );
      }
    }

    // Upsert. Delete-then-insert for per-company rows; insert-on-conflict for the session row.
    await db
      .delete(internshipFeedbackCompany)
      .where(eq(internshipFeedbackCompany.registrationId, registrationId));
    if (parsed.data.perCompany.length > 0) {
      await db.insert(internshipFeedbackCompany).values(
        parsed.data.perCompany.map((c) => ({
          registrationId,
          sessionCompanyId: c.sessionCompanyId,
          internshipDate: c.internshipDate || null,
          interactivityRating: c.interactivityRating,
          speakerRating: c.speakerRating,
          keyTakeaway: c.keyTakeaway,
          viewChangeLevel: c.viewChangeLevel,
          learningValue: c.learningValue,
          subjectClarity: c.subjectClarity,
        }))
      );
    }

    await db
      .insert(internshipFeedbackSession)
      .values({
        registrationId,
        organizationSatisfaction: parsed.data.organizationSatisfaction,
        encourageMore: parsed.data.encourageMore,
        likedAndBetter: parsed.data.likedAndBetter,
        suggestions: parsed.data.suggestions,
      })
      .onConflictDoUpdate({
        target: internshipFeedbackSession.registrationId,
        set: {
          organizationSatisfaction: parsed.data.organizationSatisfaction,
          encourageMore: parsed.data.encourageMore,
          likedAndBetter: parsed.data.likedAndBetter,
          suggestions: parsed.data.suggestions,
          updatedAt: new Date(),
        },
      });

    revalidatePath(`/admin/internship-sessions/${sessionId}/feedback`);
    revalidatePath(`/admin/internship-sessions/${sessionId}/registrations`);
    revalidatePath(`/admin/internship-sessions/${sessionId}`);

    const [reg] = await db
      .select({ studentName: internshipRegistrations.studentName })
      .from(internshipRegistrations)
      .where(eq(internshipRegistrations.id, registrationId));
    return { phase: "done", studentName: reg?.studentName ?? "" };
  }

  return { phase: "lookup", error: "Unknown action" };
}

// ─── PUBLIC: helper to find an active session that has at least one
// internship in the past (used to decide whether the /feedback page is open) ─

export async function getFeedbackEligibleSession() {
  // Newest active session, regardless of class
  const [s] = await db
    .select()
    .from(internshipSessions)
    .where(eq(internshipSessions.isActive, true));
  if (!s) return null;
  const cs = await db
    .select({ internshipDates: sessionCompanies.internshipDates })
    .from(sessionCompanies)
    .where(eq(sessionCompanies.sessionId, s.id));
  const anyOver = cs.some((c) => isInternshipOver(c.internshipDates));
  return anyOver ? s : null;
}

// ─── ADMIN ────────────────────────────────────────────────────────────────

export async function getFeedbackForSession(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");

  const regs = await db
    .select({
      id: internshipRegistrations.id,
      studentName: internshipRegistrations.studentName,
      classSection: internshipRegistrations.classSection,
      rollNumber: internshipRegistrations.rollNumber,
      parentEmail: internshipRegistrations.parentEmail,
      parentPhone: internshipRegistrations.parentPhone,
      createdAt: internshipRegistrations.createdAt,
      companyFeedbackCount: sql<number>`(
        SELECT COUNT(*) FROM internship_feedback_company ifc
        WHERE ifc.registration_id = ${sql.raw('"internship_registrations"."id"')}
      )`.as("company_feedback_count"),
      sessionFeedbackSubmitted: sql<boolean>`(
        SELECT EXISTS(
          SELECT 1 FROM internship_feedback_session ifs
          WHERE ifs.registration_id = ${sql.raw('"internship_registrations"."id"')}
        )
      )`.as("session_feedback_submitted"),
      lastFeedbackAt: sql<Date | null>`(
        SELECT MAX(ifc.updated_at) FROM internship_feedback_company ifc
        WHERE ifc.registration_id = ${sql.raw('"internship_registrations"."id"')}
      )`.as("last_feedback_at"),
    })
    .from(internshipRegistrations)
    .where(eq(internshipRegistrations.sessionId, sessionId))
    .orderBy(sql`internship_registrations.created_at DESC`);

  return regs;
}

export async function getFeedbackDetail(registrationId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");

  const [reg] = await db
    .select()
    .from(internshipRegistrations)
    .where(eq(internshipRegistrations.id, registrationId));
  if (!reg) return null;

  const perCompany = await db
    .select({
      id: internshipFeedbackCompany.id,
      sessionCompanyId: internshipFeedbackCompany.sessionCompanyId,
      companyName: companies.name,
      internshipDate: internshipFeedbackCompany.internshipDate,
      interactivityRating: internshipFeedbackCompany.interactivityRating,
      speakerRating: internshipFeedbackCompany.speakerRating,
      keyTakeaway: internshipFeedbackCompany.keyTakeaway,
      viewChangeLevel: internshipFeedbackCompany.viewChangeLevel,
      learningValue: internshipFeedbackCompany.learningValue,
      subjectClarity: internshipFeedbackCompany.subjectClarity,
      createdAt: internshipFeedbackCompany.createdAt,
      updatedAt: internshipFeedbackCompany.updatedAt,
    })
    .from(internshipFeedbackCompany)
    .innerJoin(sessionCompanies, eq(internshipFeedbackCompany.sessionCompanyId, sessionCompanies.id))
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(eq(internshipFeedbackCompany.registrationId, registrationId));

  const [session] = await db
    .select()
    .from(internshipFeedbackSession)
    .where(eq(internshipFeedbackSession.registrationId, registrationId));

  return { registration: reg, perCompany, session: session ?? null };
}
