"use server";

import { db } from "@/lib/db";
import {
  internshipRegistrations,
  internshipSessions,
  internshipFeedbackCompany,
  internshipFeedbackOps,
  sessionCompanies,
  companies,
} from "@/lib/db/schema";
import {
  feedbackLookupSchema,
  feedbackPersonalSchema,
  feedbackCompanyEntrySchema,
  feedbackOpsSchema,
} from "@/lib/validators";
import { isInternshipOver } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────

export interface BoardCompany {
  sessionCompanyId: string;
  name: string;
  sector: string;
  internshipDates: string[] | null;
  feedback: {
    internshipDate: string | null;
    interactivityRating: number;
    speakerRating: number;
    keyTakeaway: string;
    viewChangeLevel: string;
    learningValue: string;
    subjectClarity: string;
    updatedAt: Date;
  } | null;
}

export type FeedbackPhase =
  | { phase: "lookup"; error?: string }
  | {
      phase: "board";
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
      eligibleCompanies: BoardCompany[];
      ops: {
        organizationSatisfaction: string | null;
        encourageMore: string | null;
        likedAndBetter: string | null;
        suggestions: string | null;
        updatedAt: Date | null;
      };
      error?: string;
      flash?: string;
    };

// ─── Helper: build the board view (called after every successful submit) ──

async function buildBoard(
  sessionId: string,
  registrationId: string,
  flashOrError?: { error?: string; flash?: string }
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

  const eligible = sessionCompaniesAll.filter((c) => isInternshipOver(c.internshipDates ?? null));

  const existing = await db
    .select()
    .from(internshipFeedbackCompany)
    .where(eq(internshipFeedbackCompany.registrationId, registrationId));
  const byScId = new Map(existing.map((e) => [e.sessionCompanyId, e]));

  const eligibleCompanies: BoardCompany[] = eligible.map((c) => {
    const f = byScId.get(c.sessionCompanyId);
    return {
      sessionCompanyId: c.sessionCompanyId,
      name: c.name,
      sector: c.sector,
      internshipDates: (c.internshipDates ?? null) as string[] | null,
      feedback: f
        ? {
            internshipDate: f.internshipDate ?? null,
            interactivityRating: f.interactivityRating,
            speakerRating: f.speakerRating,
            keyTakeaway: f.keyTakeaway,
            viewChangeLevel: f.viewChangeLevel,
            learningValue: f.learningValue,
            subjectClarity: f.subjectClarity,
            updatedAt: f.updatedAt,
          }
        : null,
    };
  });

  const [opsRow] = await db
    .select()
    .from(internshipFeedbackOps)
    .where(eq(internshipFeedbackOps.registrationId, registrationId));

  return {
    phase: "board",
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
    ops: {
      organizationSatisfaction: opsRow?.organizationSatisfaction ?? null,
      encourageMore: opsRow?.encourageMore ?? null,
      likedAndBetter: opsRow?.likedAndBetter ?? null,
      suggestions: opsRow?.suggestions ?? null,
      updatedAt: opsRow?.updatedAt ?? null,
    },
    error: flashOrError?.error,
    flash: flashOrError?.flash,
  };
}

// ─── Server action ────────────────────────────────────────────────────────

export async function feedbackEntry(
  _prev: FeedbackPhase | null,
  formData: FormData
): Promise<FeedbackPhase> {
  const intent = (formData.get("intent") as string | null) || "lookup";

  if (intent === "lookup") {
    const parsed = feedbackLookupSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { phase: "lookup", error: parsed.error.issues[0].message };
    }
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
    return buildBoard(parsed.data.sessionId, latest.id);
  }

  const sessionId = (formData.get("sessionId") as string) || "";
  const registrationId = (formData.get("registrationId") as string) || "";

  if (intent === "submit_personal") {
    const parsed = feedbackPersonalSchema.safeParse({
      studentName: ((formData.get("studentName") as string) || "").trim(),
      parentName: ((formData.get("parentName") as string) || "").trim(),
      parentEmail: ((formData.get("parentEmail") as string) || "").trim(),
      parentPhone: ((formData.get("parentPhone") as string) || "").trim(),
    });
    if (!parsed.success) {
      return buildBoard(sessionId, registrationId, { error: parsed.error.issues[0].message });
    }
    await db
      .update(internshipRegistrations)
      .set(parsed.data)
      .where(eq(internshipRegistrations.id, registrationId));
    revalidatePath(`/admin/internship-sessions/${sessionId}/registrations`);
    return buildBoard(sessionId, registrationId, {
      flash: "Personal details saved.",
    });
  }

  if (intent === "submit_company") {
    const sessionCompanyId = (formData.get("sessionCompanyId") as string) || "";
    const parsed = feedbackCompanyEntrySchema.safeParse({
      sessionCompanyId,
      internshipDate: (formData.get("internshipDate") as string) || undefined,
      interactivityRating: Number(formData.get("interactivityRating") || 0),
      speakerRating: Number(formData.get("speakerRating") || 0),
      keyTakeaway: ((formData.get("keyTakeaway") as string) || "").trim(),
      viewChangeLevel: formData.get("viewChangeLevel"),
      learningValue: formData.get("learningValue"),
      subjectClarity: formData.get("subjectClarity"),
    });
    if (!parsed.success) {
      return buildBoard(sessionId, registrationId, { error: parsed.error.issues[0].message });
    }

    const [sc] = await db
      .select({
        id: sessionCompanies.id,
        sessionId: sessionCompanies.sessionId,
        internshipDates: sessionCompanies.internshipDates,
      })
      .from(sessionCompanies)
      .where(eq(sessionCompanies.id, sessionCompanyId));
    if (!sc || sc.sessionId !== sessionId) {
      return buildBoard(sessionId, registrationId, { error: "Invalid internship" });
    }
    if (!isInternshipOver(sc.internshipDates)) {
      return buildBoard(sessionId, registrationId, {
        error: "Feedback can only be given for internships that have already happened",
      });
    }

    const values = {
      internshipDate: parsed.data.internshipDate || null,
      interactivityRating: parsed.data.interactivityRating,
      speakerRating: parsed.data.speakerRating,
      keyTakeaway: parsed.data.keyTakeaway,
      viewChangeLevel: parsed.data.viewChangeLevel,
      learningValue: parsed.data.learningValue,
      subjectClarity: parsed.data.subjectClarity,
    };

    await db
      .insert(internshipFeedbackCompany)
      .values({ registrationId, sessionCompanyId, ...values })
      .onConflictDoUpdate({
        target: [internshipFeedbackCompany.registrationId, internshipFeedbackCompany.sessionCompanyId],
        set: { ...values, updatedAt: new Date() },
      });

    revalidatePath(`/admin/internship-sessions/${sessionId}/feedback`);
    revalidatePath(`/admin/internship-sessions/${sessionId}/registrations`);
    revalidatePath(`/admin/internship-sessions/${sessionId}`);

    return buildBoard(sessionId, registrationId, { flash: "Internship feedback saved." });
  }

  if (intent === "submit_ops") {
    const parsed = feedbackOpsSchema.safeParse({
      organizationSatisfaction: formData.get("organizationSatisfaction"),
      encourageMore: formData.get("encourageMore"),
      likedAndBetter: ((formData.get("likedAndBetter") as string) || "").trim(),
      suggestions: ((formData.get("suggestions") as string) || "").trim() || undefined,
    });
    if (!parsed.success) {
      return buildBoard(sessionId, registrationId, { error: parsed.error.issues[0].message });
    }
    const values = {
      organizationSatisfaction: parsed.data.organizationSatisfaction,
      encourageMore: parsed.data.encourageMore,
      likedAndBetter: parsed.data.likedAndBetter,
      suggestions: parsed.data.suggestions || null,
    };
    await db
      .insert(internshipFeedbackOps)
      .values({ registrationId, ...values })
      .onConflictDoUpdate({
        target: internshipFeedbackOps.registrationId,
        set: { ...values, updatedAt: new Date() },
      });
    revalidatePath(`/admin/internship-sessions/${sessionId}/feedback`);
    revalidatePath(`/admin/internship-sessions/${sessionId}`);
    return buildBoard(sessionId, registrationId, { flash: "Program feedback saved." });
  }

  return { phase: "lookup", error: "Unknown action" };
}

// ─── Public helper: any session with at least one past-date internship? ──

export async function getFeedbackEligibleSession() {
  const [s] = await db
    .select()
    .from(internshipSessions)
    .where(eq(internshipSessions.isActive, true));
  if (!s) return null;
  const cs = await db
    .select({ internshipDates: sessionCompanies.internshipDates })
    .from(sessionCompanies)
    .where(eq(sessionCompanies.sessionId, s.id));
  return cs.some((c) => isInternshipOver(c.internshipDates)) ? s : null;
}

// ─── Admin ────────────────────────────────────────────────────────────────

export async function getFeedbackForSession(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");

  return db
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
      opsFeedbackSubmitted: sql<boolean>`(
        SELECT EXISTS(
          SELECT 1 FROM internship_feedback_ops ifo
          WHERE ifo.registration_id = ${sql.raw('"internship_registrations"."id"')}
        )
      )`.as("ops_feedback_submitted"),
      lastFeedbackAt: sql<Date | null>`GREATEST(
        (SELECT MAX(ifc.updated_at) FROM internship_feedback_company ifc
          WHERE ifc.registration_id = ${sql.raw('"internship_registrations"."id"')}),
        (SELECT MAX(ifo.updated_at) FROM internship_feedback_ops ifo
          WHERE ifo.registration_id = ${sql.raw('"internship_registrations"."id"')})
      )`.as("last_feedback_at"),
    })
    .from(internshipRegistrations)
    .where(eq(internshipRegistrations.sessionId, sessionId))
    .orderBy(sql`internship_registrations.created_at DESC`);
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

  const [ops] = await db
    .select()
    .from(internshipFeedbackOps)
    .where(eq(internshipFeedbackOps.registrationId, registrationId));

  return { registration: reg, perCompany, ops: ops ?? null };
}
