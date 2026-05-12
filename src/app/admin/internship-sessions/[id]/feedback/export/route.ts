import { isAuthenticated } from "@/lib/auth";
import { formatIstForCsv } from "@/lib/format";
import { db } from "@/lib/db";
import {
  internshipRegistrations,
  internshipFeedbackCompany,
  internshipFeedbackSession,
  sessionCompanies,
  companies,
  internshipSessions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const [session] = await db
    .select()
    .from(internshipSessions)
    .where(eq(internshipSessions.id, id));
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fetch per-company feedback joined with registration + company
  const companyRows = await db
    .select({
      regId: internshipRegistrations.id,
      registeredAt: internshipRegistrations.createdAt,
      studentName: internshipRegistrations.studentName,
      classSection: internshipRegistrations.classSection,
      rollNumber: internshipRegistrations.rollNumber,
      parentEmail: internshipRegistrations.parentEmail,
      parentPhone: internshipRegistrations.parentPhone,
      companyName: companies.name,
      internshipDate: internshipFeedbackCompany.internshipDate,
      interactivityRating: internshipFeedbackCompany.interactivityRating,
      speakerRating: internshipFeedbackCompany.speakerRating,
      keyTakeaway: internshipFeedbackCompany.keyTakeaway,
      viewChangeLevel: internshipFeedbackCompany.viewChangeLevel,
      learningValue: internshipFeedbackCompany.learningValue,
      subjectClarity: internshipFeedbackCompany.subjectClarity,
      submittedAt: internshipFeedbackCompany.updatedAt,
    })
    .from(internshipFeedbackCompany)
    .innerJoin(
      internshipRegistrations,
      eq(internshipFeedbackCompany.registrationId, internshipRegistrations.id)
    )
    .innerJoin(
      sessionCompanies,
      eq(internshipFeedbackCompany.sessionCompanyId, sessionCompanies.id)
    )
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(eq(internshipRegistrations.sessionId, id));

  // Fetch session feedback keyed by registrationId so we can append it
  const sessionRows = await db
    .select({
      regId: internshipFeedbackSession.registrationId,
      organizationSatisfaction: internshipFeedbackSession.organizationSatisfaction,
      encourageMore: internshipFeedbackSession.encourageMore,
      likedAndBetter: internshipFeedbackSession.likedAndBetter,
      suggestions: internshipFeedbackSession.suggestions,
    })
    .from(internshipFeedbackSession)
    .innerJoin(
      internshipRegistrations,
      eq(internshipFeedbackSession.registrationId, internshipRegistrations.id)
    )
    .where(eq(internshipRegistrations.sessionId, id));
  const sessionByReg = new Map(sessionRows.map((r) => [r.regId, r]));

  const headers = [
    "Submitted At",
    "Registered At",
    "Student Name",
    "Class/Section",
    "Roll Number",
    "Parent Email",
    "Parent Phone",
    "Company",
    "Attended Date",
    "Interactivity (1-5)",
    "Speakers (1-5)",
    "Key Takeaway",
    "View Change",
    "Learning Value",
    "Subject Clarity",
    "Org Satisfaction (overall)",
    "Encourage More (overall)",
    "Liked / Better (overall)",
    "Suggestions (overall)",
  ];

  const rows = companyRows.map((c) => {
    const s = sessionByReg.get(c.regId);
    return [
      formatIstForCsv(c.submittedAt),
      formatIstForCsv(c.registeredAt),
      c.studentName,
      c.classSection,
      c.rollNumber,
      c.parentEmail,
      c.parentPhone,
      c.companyName,
      c.internshipDate || "",
      c.interactivityRating,
      c.speakerRating,
      c.keyTakeaway,
      c.viewChangeLevel,
      c.learningValue,
      c.subjectClarity,
      s?.organizationSatisfaction ?? "",
      s?.encourageMore ?? "",
      s?.likedAndBetter ?? "",
      s?.suggestions ?? "",
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `internship-feedback-${session.title.replace(/\s+/g, "-")}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
