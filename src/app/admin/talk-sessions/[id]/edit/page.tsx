import { db } from "@/lib/db";
import { utcToIstLocalInput } from "@/lib/format";
import { talkSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EditTalkSessionForm } from "./EditTalkSessionForm";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function EditTalkSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const [session] = await db
    .select()
    .from(talkSessions)
    .where(eq(talkSessions.id, id));
  if (!session) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit Talk Session"
        subtitle="Update session details, date, time slot and registration deadline."
        backHref={`/admin/talk-sessions/${id}`}
        backLabel="Back to Session"
      />
      <EditTalkSessionForm
        session={{
          id: session.id,
          title: session.title,
          editionLabel: session.editionLabel,
          targetClass: session.targetClass,
          description: session.description,
          sessionDate: session.sessionDate,
          timeSlot: session.timeSlot,
          regDeadline: utcToIstLocalInput(session.regDeadline),
        }}
      />
    </div>
  );
}
