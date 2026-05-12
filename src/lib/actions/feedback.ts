"use server";

import { db } from "@/lib/db";
import {
  internshipRegistrations,
  internshipSessions,
  internshipFeedbackCompany,
  sessionCompanies,
  companies,
} from "@/lib/db/schema";
import {
  feedbackPersonalSchema,
  feedbackCompanyEntrySchema,
  feedbackOpsForCompanySchema,
} from "@/lib/validators";
import { isInternshipOver } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import { eq, sql, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────

export interface BoardCompany {
  sessionCompanyId: string;
  name: string;
  sector: string;
  // The specific date this board entry represents (one row per company-date).
  // null only when the company has no recorded dates.
  internshipDate: string | null;
  feedback: {
    studentName: string;
    classSection: string;
    rollNumber: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    internshipDate: string | null;
    interactivityRating: number | null;
    speakerRating: number | null;
    keyTakeaway: string | null;
    viewChangeLevel: string | null;
    learningValue: string | null;
    subjectClarity: string | null;
    organizationSatisfaction: string | null;
    encourageMore: string | null;
    likedAndBetter: string | null;
    suggestions: string | null;
    updatedAt: Date;
  } | null;
}

export type FeedbackPhase = {
  phase: "board";
  sessionId: string;
  currentStudent: {
    studentName: string;
    classSection: string;
    rollNumber: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
  } | null;
  eligibleCompanies: BoardCompany[];
  error?: string;
  flash?: string;
  lastSubmittedScId?: string;
  lastSubmittedDate?: string | null;
  lastSubmittedStep?: "personal" | "section2" | "section3";
};

// ─── Helpers ──────────────────────────────────────────────────────────────

async function buildBoard(
  sessionId: string,
  student: {
    classSection: string;
    rollNumber: string;
    studentName: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
  } | null,
  extra?: {
    error?: string;
    flash?: string;
    lastSubmittedScId?: string;
    lastSubmittedDate?: string | null;
    lastSubmittedStep?: "personal" | "section2" | "section3";
  }
): Promise<FeedbackPhase> {
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

  const eligibleCompanyRows = sessionCompaniesAll.filter((c) =>
    isInternshipOver(c.internshipDates ?? null)
  );

  // Pull existing feedback rows for THIS student (if we know who they are)
  const existing = student
    ? await db
        .select()
        .from(internshipFeedbackCompany)
        .where(
          sql`lower(${internshipFeedbackCompany.classSection}) = lower(${student.classSection})
            AND lower(${internshipFeedbackCompany.rollNumber}) = lower(${student.rollNumber})`
        )
    : [];
  // Key on `${scId}|${date ?? ""}` so multi-date entries have their own row
  const byKey = new Map(
    existing.map((e) => [`${e.sessionCompanyId}|${e.internshipDate ?? ""}`, e])
  );

  // Expand each company into one board entry per internship date (or a single
  // entry with null date when no dates are recorded).
  const eligibleCompanies: BoardCompany[] = eligibleCompanyRows.flatMap((c) => {
    const dates =
      c.internshipDates && c.internshipDates.length > 0
        ? c.internshipDates
        : [null];
    return dates.map((d) => {
      const f = byKey.get(`${c.sessionCompanyId}|${d ?? ""}`);
      return {
        sessionCompanyId: c.sessionCompanyId,
        name: c.name,
        sector: c.sector,
        internshipDate: d,
        feedback: f
          ? {
              studentName: f.studentName,
              classSection: f.classSection,
              rollNumber: f.rollNumber,
              parentName: f.parentName,
              parentEmail: f.parentEmail,
              parentPhone: f.parentPhone,
              internshipDate: f.internshipDate ?? null,
              interactivityRating: f.interactivityRating ?? null,
              speakerRating: f.speakerRating ?? null,
              keyTakeaway: f.keyTakeaway ?? null,
              viewChangeLevel: f.viewChangeLevel ?? null,
              learningValue: f.learningValue ?? null,
              subjectClarity: f.subjectClarity ?? null,
              organizationSatisfaction: f.organizationSatisfaction ?? null,
              encourageMore: f.encourageMore ?? null,
              likedAndBetter: f.likedAndBetter ?? null,
              suggestions: f.suggestions ?? null,
              updatedAt: f.updatedAt,
            }
          : null,
      };
    });
  });

  return {
    phase: "board",
    sessionId,
    currentStudent: student,
    eligibleCompanies,
    error: extra?.error,
    flash: extra?.flash,
    lastSubmittedScId: extra?.lastSubmittedScId,
    lastSubmittedDate: extra?.lastSubmittedDate,
    lastSubmittedStep: extra?.lastSubmittedStep,
  };
}

async function findRowId(
  sessionCompanyId: string,
  internshipDate: string | null,
  classSection: string,
  rollNumber: string
) {
  const [row] = await db
    .select({ id: internshipFeedbackCompany.id })
    .from(internshipFeedbackCompany)
    .where(
      sql`${internshipFeedbackCompany.sessionCompanyId} = ${sessionCompanyId}
        AND ${internshipFeedbackCompany.internshipDate} IS NOT DISTINCT FROM ${internshipDate}
        AND lower(${internshipFeedbackCompany.classSection}) = lower(${classSection})
        AND lower(${internshipFeedbackCompany.rollNumber}) = lower(${rollNumber})`
    );
  return row?.id ?? null;
}

// ─── Initial board (called by the page on first render) ──────────────────

export async function getInitialBoard(sessionId: string): Promise<FeedbackPhase> {
  return buildBoard(sessionId, null);
}

// ─── Server action — handles all wizard submits ──────────────────────────

export async function feedbackEntry(
  _prev: FeedbackPhase | null,
  formData: FormData
): Promise<FeedbackPhase> {
  const sessionId = (formData.get("sessionId") as string) || "";
  const intent = (formData.get("intent") as string) || "";

  // Personal info always comes along (from hidden fields) so subsequent steps
  // can identify the row and so the board reflects this student's progress.
  const student = {
    studentName: ((formData.get("studentName") as string) || "").trim(),
    classSection: ((formData.get("classSection") as string) || "").trim(),
    rollNumber: ((formData.get("rollNumber") as string) || "").trim(),
    parentName: ((formData.get("parentName") as string) || "").trim(),
    parentEmail: ((formData.get("parentEmail") as string) || "").trim(),
    parentPhone: ((formData.get("parentPhone") as string) || "").trim(),
  };
  const studentForBoard = student.classSection && student.rollNumber ? student : null;

  const sessionCompanyId = (formData.get("sessionCompanyId") as string) || "";
  const rawDate = ((formData.get("internshipDate") as string) || "").trim();
  const internshipDate = rawDate || null;

  if (intent === "submit_personal") {
    const parsed = feedbackPersonalSchema.safeParse(student);
    if (!parsed.success) {
      return buildBoard(sessionId, studentForBoard, {
        error: parsed.error.issues[0].message,
        lastSubmittedScId: sessionCompanyId || undefined,
      });
    }
    if (!sessionCompanyId) {
      return buildBoard(sessionId, parsed.data, { error: "Missing internship" });
    }
    // Validate session_company belongs to this session and is past-date
    const [sc] = await db
      .select({
        id: sessionCompanies.id,
        sessionId: sessionCompanies.sessionId,
        internshipDates: sessionCompanies.internshipDates,
      })
      .from(sessionCompanies)
      .where(eq(sessionCompanies.id, sessionCompanyId));
    if (!sc || sc.sessionId !== sessionId) {
      return buildBoard(sessionId, parsed.data, { error: "Invalid internship" });
    }
    if (!isInternshipOver(sc.internshipDates)) {
      return buildBoard(sessionId, parsed.data, {
        error: "Feedback can only be given for internships that have already happened",
      });
    }

    const existingId = await findRowId(
      sessionCompanyId,
      internshipDate,
      parsed.data.classSection,
      parsed.data.rollNumber
    );
    if (existingId) {
      await db
        .update(internshipFeedbackCompany)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(internshipFeedbackCompany.id, existingId));
    } else {
      await db.insert(internshipFeedbackCompany).values({
        sessionCompanyId,
        internshipDate,
        ...parsed.data,
      });
    }

    revalidatePath(`/admin/internship-sessions/${sessionId}/feedback`);
    revalidatePath(`/admin/internship-sessions/${sessionId}`);
    return buildBoard(sessionId, parsed.data, {
      flash: "Personal details saved.",
      lastSubmittedScId: sessionCompanyId,
      lastSubmittedDate: internshipDate,
      lastSubmittedStep: "personal",
    });
  }

  if (intent === "submit_section_2") {
    if (!studentForBoard) {
      return buildBoard(sessionId, null, {
        error: "Please fill personal details first",
        lastSubmittedScId: sessionCompanyId,
      });
    }
    const parsed = feedbackCompanyEntrySchema.safeParse({
      sessionCompanyId,
      internshipDate: internshipDate ?? undefined,
      interactivityRating: Number(formData.get("interactivityRating") || 0),
      speakerRating: Number(formData.get("speakerRating") || 0),
      keyTakeaway: ((formData.get("keyTakeaway") as string) || "").trim(),
      viewChangeLevel: formData.get("viewChangeLevel"),
      learningValue: formData.get("learningValue"),
      subjectClarity: formData.get("subjectClarity"),
    });
    if (!parsed.success) {
      return buildBoard(sessionId, studentForBoard, {
        error: parsed.error.issues[0].message,
        lastSubmittedScId: sessionCompanyId,
        lastSubmittedDate: internshipDate,
      });
    }
    const existingId = await findRowId(
      sessionCompanyId,
      internshipDate,
      studentForBoard.classSection,
      studentForBoard.rollNumber
    );
    if (!existingId) {
      return buildBoard(sessionId, studentForBoard, {
        error: "Please fill personal details first",
        lastSubmittedScId: sessionCompanyId,
        lastSubmittedDate: internshipDate,
      });
    }
    await db
      .update(internshipFeedbackCompany)
      .set({
        interactivityRating: parsed.data.interactivityRating,
        speakerRating: parsed.data.speakerRating,
        keyTakeaway: parsed.data.keyTakeaway,
        viewChangeLevel: parsed.data.viewChangeLevel,
        learningValue: parsed.data.learningValue,
        subjectClarity: parsed.data.subjectClarity,
        updatedAt: new Date(),
      })
      .where(eq(internshipFeedbackCompany.id, existingId));
    revalidatePath(`/admin/internship-sessions/${sessionId}/feedback`);
    revalidatePath(`/admin/internship-sessions/${sessionId}`);
    return buildBoard(sessionId, studentForBoard, {
      flash: "Internship feedback saved.",
      lastSubmittedScId: sessionCompanyId,
      lastSubmittedDate: internshipDate,
      lastSubmittedStep: "section2",
    });
  }

  if (intent === "submit_section_3") {
    if (!studentForBoard) {
      return buildBoard(sessionId, null, {
        error: "Please fill personal details first",
        lastSubmittedScId: sessionCompanyId,
      });
    }
    const parsed = feedbackOpsForCompanySchema.safeParse({
      sessionCompanyId,
      organizationSatisfaction: formData.get("organizationSatisfaction"),
      encourageMore: formData.get("encourageMore"),
      likedAndBetter: ((formData.get("likedAndBetter") as string) || "").trim(),
      suggestions: ((formData.get("suggestions") as string) || "").trim() || undefined,
    });
    if (!parsed.success) {
      return buildBoard(sessionId, studentForBoard, {
        error: parsed.error.issues[0].message,
        lastSubmittedScId: sessionCompanyId,
      });
    }
    const existingId = await findRowId(
      sessionCompanyId,
      internshipDate,
      studentForBoard.classSection,
      studentForBoard.rollNumber
    );
    if (!existingId) {
      return buildBoard(sessionId, studentForBoard, {
        error: "Please fill personal details first",
        lastSubmittedScId: sessionCompanyId,
        lastSubmittedDate: internshipDate,
      });
    }
    await db
      .update(internshipFeedbackCompany)
      .set({
        organizationSatisfaction: parsed.data.organizationSatisfaction,
        encourageMore: parsed.data.encourageMore,
        likedAndBetter: parsed.data.likedAndBetter,
        suggestions: parsed.data.suggestions || null,
        updatedAt: new Date(),
      })
      .where(eq(internshipFeedbackCompany.id, existingId));
    revalidatePath(`/admin/internship-sessions/${sessionId}/feedback`);
    revalidatePath(`/admin/internship-sessions/${sessionId}`);
    return buildBoard(sessionId, studentForBoard, {
      flash: "Program feedback saved. Thanks!",
      lastSubmittedScId: sessionCompanyId,
      lastSubmittedDate: internshipDate,
      lastSubmittedStep: "section3",
    });
  }

  return buildBoard(sessionId, studentForBoard, { error: "Unknown action" });
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

  // Group feedback rows by the student tuple (class+roll, case-insensitive)
  // and report counts. Since feedback is now decoupled from registrations,
  // we also LEFT JOIN to find the registration if one exists for context.
  const rows = await db
    .select({
      key: sql<string>`lower(${internshipFeedbackCompany.classSection}) || '|' || lower(${internshipFeedbackCompany.rollNumber})`,
      classSection: internshipFeedbackCompany.classSection,
      rollNumber: internshipFeedbackCompany.rollNumber,
      studentName: internshipFeedbackCompany.studentName,
      parentEmail: internshipFeedbackCompany.parentEmail,
      parentPhone: internshipFeedbackCompany.parentPhone,
      sessionCompanyId: internshipFeedbackCompany.sessionCompanyId,
      companyName: companies.name,
      internshipDate: internshipFeedbackCompany.internshipDate,
      interactivityRating: internshipFeedbackCompany.interactivityRating,
      organizationSatisfaction: internshipFeedbackCompany.organizationSatisfaction,
      updatedAt: internshipFeedbackCompany.updatedAt,
    })
    .from(internshipFeedbackCompany)
    .innerJoin(sessionCompanies, eq(internshipFeedbackCompany.sessionCompanyId, sessionCompanies.id))
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(eq(sessionCompanies.sessionId, sessionId));

  // Roll up per student
  type Agg = {
    key: string;
    classSection: string;
    rollNumber: string;
    studentName: string;
    parentEmail: string;
    parentPhone: string;
    section2Count: number;
    completeCount: number;
    lastUpdatedAt: Date;
    registrationId: string | null;
    internships: { companyName: string; internshipDate: string | null }[];
  };
  const byKey = new Map<string, Agg>();
  for (const r of rows) {
    const existing = byKey.get(r.key);
    const hasSection2 = r.interactivityRating !== null;
    const hasSection3 = !!r.organizationSatisfaction;
    const intern = { companyName: r.companyName, internshipDate: r.internshipDate };
    if (!existing) {
      byKey.set(r.key, {
        key: r.key,
        classSection: r.classSection,
        rollNumber: r.rollNumber,
        studentName: r.studentName,
        parentEmail: r.parentEmail,
        parentPhone: r.parentPhone,
        section2Count: hasSection2 ? 1 : 0,
        completeCount: hasSection3 ? 1 : 0,
        lastUpdatedAt: r.updatedAt,
        registrationId: null,
        internships: [intern],
      });
    } else {
      if (hasSection2) existing.section2Count++;
      if (hasSection3) existing.completeCount++;
      if (r.updatedAt > existing.lastUpdatedAt) existing.lastUpdatedAt = r.updatedAt;
      existing.internships.push(intern);
    }
  }

  // Try to pair each with an existing registration for the admin "View" link
  for (const agg of byKey.values()) {
    const [reg] = await db
      .select({ id: internshipRegistrations.id })
      .from(internshipRegistrations)
      .where(
        and(
          eq(internshipRegistrations.sessionId, sessionId),
          sql`lower(${internshipRegistrations.classSection}) = lower(${agg.classSection})`,
          sql`lower(${internshipRegistrations.rollNumber}) = lower(${agg.rollNumber})`
        )
      );
    agg.registrationId = reg?.id ?? null;
  }

  return Array.from(byKey.values()).sort(
    (a, b) => b.lastUpdatedAt.getTime() - a.lastUpdatedAt.getTime()
  );
}

export async function deleteFeedbackEntry(id: string, sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  await db.delete(internshipFeedbackCompany).where(eq(internshipFeedbackCompany.id, id));
  revalidatePath(`/admin/internship-sessions/${sessionId}/feedback`);
  revalidatePath(`/admin/internship-sessions/${sessionId}`);
}

export async function deleteAllFeedbackForStudent(
  sessionId: string,
  classSection: string,
  rollNumber: string
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  // Scope to this session via subquery on session_company
  const scIds = await db
    .select({ id: sessionCompanies.id })
    .from(sessionCompanies)
    .where(eq(sessionCompanies.sessionId, sessionId));
  if (scIds.length === 0) return;
  await db.delete(internshipFeedbackCompany).where(
    and(
      inArray(
        internshipFeedbackCompany.sessionCompanyId,
        scIds.map((s) => s.id)
      ),
      sql`lower(${internshipFeedbackCompany.classSection}) = lower(${classSection})`,
      sql`lower(${internshipFeedbackCompany.rollNumber}) = lower(${rollNumber})`
    )
  );
  revalidatePath(`/admin/internship-sessions/${sessionId}/feedback`);
  revalidatePath(`/admin/internship-sessions/${sessionId}`);
}

export async function getFeedbackDetailForStudent(
  sessionId: string,
  classSection: string,
  rollNumber: string
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");

  const perCompany = await db
    .select({
      id: internshipFeedbackCompany.id,
      sessionCompanyId: internshipFeedbackCompany.sessionCompanyId,
      companyName: companies.name,
      studentName: internshipFeedbackCompany.studentName,
      classSection: internshipFeedbackCompany.classSection,
      rollNumber: internshipFeedbackCompany.rollNumber,
      parentName: internshipFeedbackCompany.parentName,
      parentEmail: internshipFeedbackCompany.parentEmail,
      parentPhone: internshipFeedbackCompany.parentPhone,
      internshipDate: internshipFeedbackCompany.internshipDate,
      interactivityRating: internshipFeedbackCompany.interactivityRating,
      speakerRating: internshipFeedbackCompany.speakerRating,
      keyTakeaway: internshipFeedbackCompany.keyTakeaway,
      viewChangeLevel: internshipFeedbackCompany.viewChangeLevel,
      learningValue: internshipFeedbackCompany.learningValue,
      subjectClarity: internshipFeedbackCompany.subjectClarity,
      organizationSatisfaction: internshipFeedbackCompany.organizationSatisfaction,
      encourageMore: internshipFeedbackCompany.encourageMore,
      likedAndBetter: internshipFeedbackCompany.likedAndBetter,
      suggestions: internshipFeedbackCompany.suggestions,
      updatedAt: internshipFeedbackCompany.updatedAt,
    })
    .from(internshipFeedbackCompany)
    .innerJoin(sessionCompanies, eq(internshipFeedbackCompany.sessionCompanyId, sessionCompanies.id))
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(
      sql`${sessionCompanies.sessionId} = ${sessionId}
        AND lower(${internshipFeedbackCompany.classSection}) = lower(${classSection})
        AND lower(${internshipFeedbackCompany.rollNumber}) = lower(${rollNumber})`
    );
  if (perCompany.length === 0) return null;
  return {
    student: {
      studentName: perCompany[0].studentName,
      classSection: perCompany[0].classSection,
      rollNumber: perCompany[0].rollNumber,
      parentName: perCompany[0].parentName,
      parentEmail: perCompany[0].parentEmail,
      parentPhone: perCompany[0].parentPhone,
    },
    perCompany,
  };
}
