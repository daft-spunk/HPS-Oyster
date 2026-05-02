import { getSpeaker } from "@/lib/actions/library";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EditSpeakerForm } from "./EditSpeakerForm";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function EditSpeakerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const speaker = await getSpeaker(id);
  if (!speaker) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Edit: ${speaker.name}`}
        backHref="/admin/library/speakers"
        backLabel="Back to Speakers"
      />
      <EditSpeakerForm speaker={speaker} />
    </div>
  );
}
