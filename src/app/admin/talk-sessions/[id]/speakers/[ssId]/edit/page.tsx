import { db } from "@/lib/db";
import { sessionSpeakers, speakers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EditSessionSpeakerForm } from "./EditSessionSpeakerForm";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function EditSessionSpeakerPage({
  params,
}: {
  params: Promise<{ id: string; ssId: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id: sessionId, ssId } = await params;

  const [row] = await db
    .select({
      id: sessionSpeakers.id,
      sessionId: sessionSpeakers.sessionId,
      speakerName: speakers.name,
      topic: sessionSpeakers.topic,
      topicDescription: sessionSpeakers.topicDescription,
      venue: sessionSpeakers.venue,
      slotLimit: sessionSpeakers.slotLimit,
      displayOrder: sessionSpeakers.displayOrder,
    })
    .from(sessionSpeakers)
    .innerJoin(speakers, eq(sessionSpeakers.speakerId, speakers.id))
    .where(eq(sessionSpeakers.id, ssId));
  if (!row || row.sessionId !== sessionId) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Edit Speaker – ${row.speakerName}`}
        subtitle="Update what students see for this speaker in this session."
        backHref={`/admin/talk-sessions/${sessionId}`}
        backLabel="Back to Session"
      />
      <EditSessionSpeakerForm
        sessionId={sessionId}
        sessionSpeaker={{
          id: row.id,
          topic: row.topic,
          topicDescription: row.topicDescription,
          venue: row.venue,
          slotLimit: row.slotLimit,
          displayOrder: row.displayOrder,
        }}
      />
    </div>
  );
}
