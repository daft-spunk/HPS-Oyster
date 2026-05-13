import { isAuthenticated } from "@/lib/auth";
import { formatIstForCsv } from "@/lib/format";
import { db } from "@/lib/db";
import {
  internshipFeedbackCompany,
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

  const rowsData = await db
    .select({
      submittedAt: internshipFeedbackCompany.updatedAt,
      studentName: internshipFeedbackCompany.studentName,
      classSection: internshipFeedbackCompany.classSection,
      rollNumber: internshipFeedbackCompany.rollNumber,
      parentName: internshipFeedbackCompany.parentName,
      parentEmail: internshipFeedbackCompany.parentEmail,
      parentPhone: internshipFeedbackCompany.parentPhone,
      companyName: companies.name,
      internshipDate: internshipFeedbackCompany.internshipDate,
      interactivityRating: internshipFeedbackCompany.interactivityRating,
      speakerRating: internshipFeedbackCompany.speakerRating,
      learnings: internshipFeedbackCompany.learnings,
      keyTakeaway: internshipFeedbackCompany.keyTakeaway,
      viewChangeLevel: internshipFeedbackCompany.viewChangeLevel,
      learningValue: internshipFeedbackCompany.learningValue,
      subjectClarity: internshipFeedbackCompany.subjectClarity,
      organizationSatisfaction: internshipFeedbackCompany.organizationSatisfaction,
      encourageMore: internshipFeedbackCompany.encourageMore,
      likedAndBetter: internshipFeedbackCompany.likedAndBetter,
      suggestions: internshipFeedbackCompany.suggestions,
    })
    .from(internshipFeedbackCompany)
    .innerJoin(
      sessionCompanies,
      eq(internshipFeedbackCompany.sessionCompanyId, sessionCompanies.id)
    )
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(eq(sessionCompanies.sessionId, id));

  const headers = [
    "Submitted At",
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
    "What They Learnt",
    "Key Takeaway",
    "View Change",
    "Learning Value",
    "Subject Clarity",
    "Org Satisfaction",
    "Encourage More",
    "Liked / Better",
    "Suggestions",
    "Complete?",
  ];

  const rows = rowsData.map((c) => {
    const complete =
      c.organizationSatisfaction && c.encourageMore && c.likedAndBetter ? "Yes" : "No";
    return [
      formatIstForCsv(c.submittedAt),
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
      c.learnings,
      c.keyTakeaway,
      c.viewChangeLevel,
      c.learningValue,
      c.subjectClarity,
      c.organizationSatisfaction ?? "",
      c.encourageMore ?? "",
      c.likedAndBetter ?? "",
      c.suggestions ?? "",
      complete,
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
