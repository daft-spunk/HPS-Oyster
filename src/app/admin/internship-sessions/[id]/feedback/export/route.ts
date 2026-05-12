import { isAuthenticated } from "@/lib/auth";
import { formatIstForCsv } from "@/lib/format";
import { db } from "@/lib/db";
import {
  internshipRegistrations,
  internshipFeedbackCompany,
  internshipFeedbackOps,
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

  // Per-company rows joined with the optional ops feedback for the same registration.
  const rowsData = await db
    .select({
      registeredAt: internshipRegistrations.createdAt,
      submittedAt: internshipFeedbackCompany.updatedAt,
      studentName: internshipRegistrations.studentName,
      classSection: internshipRegistrations.classSection,
      rollNumber: internshipRegistrations.rollNumber,
      parentName: internshipRegistrations.parentName,
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
      opsOrgSatisfaction: internshipFeedbackOps.organizationSatisfaction,
      opsEncourageMore: internshipFeedbackOps.encourageMore,
      opsLikedAndBetter: internshipFeedbackOps.likedAndBetter,
      opsSuggestions: internshipFeedbackOps.suggestions,
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
    .leftJoin(
      internshipFeedbackOps,
      eq(internshipFeedbackOps.registrationId, internshipRegistrations.id)
    )
    .where(eq(internshipRegistrations.sessionId, id));

  const headers = [
    "Submitted At",
    "Registered At",
    "Student Name",
    "Class/Section",
    "Roll Number",
    "Parent Name",
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
    "Ops: Org Satisfaction",
    "Ops: Encourage More",
    "Ops: Liked / Better",
    "Ops: Suggestions",
  ];

  const rows = rowsData.map((c) =>
    [
      formatIstForCsv(c.submittedAt),
      formatIstForCsv(c.registeredAt),
      c.studentName,
      c.classSection,
      c.rollNumber,
      c.parentName,
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
      c.opsOrgSatisfaction ?? "",
      c.opsEncourageMore ?? "",
      c.opsLikedAndBetter ?? "",
      c.opsSuggestions ?? "",
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `internship-feedback-${session.title.replace(/\s+/g, "-")}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
