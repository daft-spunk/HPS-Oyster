import { db } from "@/lib/db";
import { utcToIstLocalInput } from "@/lib/format";
import { internshipSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EditInternshipSessionForm } from "./EditInternshipSessionForm";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function EditInternshipSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const [session] = await db
    .select()
    .from(internshipSessions)
    .where(eq(internshipSessions.id, id));
  if (!session) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit Internship Session"
        subtitle="Update session details, including the about-this-internship sections shown to students."
        backHref={`/admin/internship-sessions/${id}`}
        backLabel="Back to Session"
      />
      <EditInternshipSessionForm
        session={{
          id: session.id,
          title: session.title,
          editionLabel: session.editionLabel,
          targetClass: session.targetClass,
          maxPreferences: session.maxPreferences,
          registrationCutoffDays: session.registrationCutoffDays,
          description: session.description,
          regDeadline: utcToIstLocalInput(session.regDeadline),
        }}
      />
    </div>
  );
}
