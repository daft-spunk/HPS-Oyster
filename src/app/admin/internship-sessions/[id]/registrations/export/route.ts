import { getInternshipRegistrations, getInternshipSessionWithCompanies } from "@/lib/actions/internships";
import { isAuthenticated } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [session, registrations] = await Promise.all([
    getInternshipSessionWithCompanies(id),
    getInternshipRegistrations(id),
  ]);

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headers = [
    "Registered At",
    "Student Name",
    "Class/Section",
    "Roll Number",
    "Parent Name",
    "Parent Email",
    "Parent Phone",
    "Interests",
    "Preference 1",
    "Reason 1",
    "Preference 2",
    "Reason 2",
    "Preference 3",
    "Reason 3",
  ];

  const rows = registrations.map((r) =>
    [
      r.createdAt ? new Date(r.createdAt).toISOString() : "",
      r.studentName,
      r.classSection,
      r.rollNumber,
      r.parentName,
      r.parentEmail,
      r.parentPhone,
      r.interests || "",
      r.pref1Company,
      r.pref1Reason,
      r.pref2Company,
      r.pref2Reason,
      r.pref3Company,
      r.pref3Reason,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `internship-registrations-${session.title.replace(/\s+/g, "-")}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
