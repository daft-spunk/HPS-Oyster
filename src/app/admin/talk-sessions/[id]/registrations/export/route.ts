import { getTalkRegistrations, getSessionWithSpeakers } from "@/lib/actions/talks";
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
    getSessionWithSpeakers(id),
    getTalkRegistrations(id),
  ]);

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headers = [
    "Student Name",
    "Class/Section",
    "Roll Number",
    "Speaker",
    "Topic",
    "Parent Name",
    "Parent Email",
    "Parent Phone",
    "Why Attend",
    "Registered At",
  ];

  const rows = registrations.map((r) =>
    [
      r.studentName,
      r.classSection,
      r.rollNumber,
      r.speakerName,
      r.speakerTopic,
      r.parentName,
      r.parentEmail,
      r.parentPhone,
      r.whyAttend,
      r.createdAt ? new Date(r.createdAt).toISOString() : "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `talk-registrations-${session.title.replace(/\s+/g, "-")}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
