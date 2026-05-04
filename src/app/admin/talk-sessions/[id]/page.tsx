import { getSessionWithSpeakers, removeSpeakerFromSession, toggleSessionSpeakerActive } from "@/lib/actions/talks";
import { getAllSpeakers } from "@/lib/actions/library";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { LinkSpeakerForm } from "./LinkSpeakerForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmFormButton } from "@/components/admin/ConfirmFormButton";
import { formatTargetClass } from "@/lib/format";

export default async function TalkSessionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const [session, allSpeakers] = await Promise.all([
    getSessionWithSpeakers(id),
    getAllSpeakers(),
  ]);
  if (!session) notFound();

  const linkedIds = new Set(session.speakers.map((s) => s.speakerId));
  const availableSpeakers = allSpeakers.filter((s) => !linkedIds.has(s.id));

  return (
    <div>
      <PageHeader
        title={session.title}
        subtitle={`${formatTargetClass(session.targetClass)} · ${session.editionLabel}${session.sessionDate ? ` · ${session.sessionDate}` : ""}`}
        backHref="/admin/talk-sessions"
        backLabel="Back to Talk Sessions"
        action={
          <Link
            href={`/admin/talk-sessions/${id}/registrations`}
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
          >
            View Registrations
          </Link>
        }
      />

      {/* Linked Speakers */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Speakers in this Session ({session.speakers.length})
        </h2>
        {session.speakers.length > 0 ? (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Speaker</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Topic</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Venue</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Slots</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Order</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {session.speakers.map((s) => (
                  <tr key={s.sessionSpeakerId} className={s.isActive ? "" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium">
                      <span className={s.isActive ? "" : "text-gray-400"}>{s.name}</span>
                      {s.batchYear && (
                        <span className="text-gray-400 text-xs"> · {s.batchYear}</span>
                      )}
                      {!s.isActive && (
                        <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.topic}</td>
                    <td className="px-4 py-3 text-gray-500">{s.venue || "—"}</td>
                    <td className="px-4 py-3">
                      {Number(s.registrationCount)}/{s.slotLimit}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.displayOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-3 items-center">
                        <form
                          action={toggleSessionSpeakerActive.bind(null, s.sessionSpeakerId, id)}
                          className="inline"
                        >
                          {s.isActive ? (
                            <ConfirmFormButton
                              message={`Deactivate ${s.name}? They will be hidden from public registration but their topic and details will be kept so you can reactivate later.`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Deactivate
                            </ConfirmFormButton>
                          ) : (
                            <button className="text-xs text-blue-600 hover:underline">
                              Activate
                            </button>
                          )}
                        </form>
                        <Link
                          href={`/admin/talk-sessions/${id}/speakers/${s.sessionSpeakerId}/edit`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <form
                          action={removeSpeakerFromSession.bind(null, s.sessionSpeakerId, id)}
                          className="inline"
                        >
                          <ConfirmFormButton
                            message={`Remove ${s.name} from this session? Their topic, About-the-Topic, venue and slot settings will be lost. Use Deactivate instead if you only want to hide them temporarily.`}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Remove
                          </ConfirmFormButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 bg-white border rounded-lg p-6">
            No speakers linked yet. Pick from your Library below to add some.
          </p>
        )}
      </div>

      {/* Add speaker from library */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Link a Speaker from Library
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          {allSpeakers.length === 0 ? (
            <>
              Your library is empty.{" "}
              <Link href="/admin/library/speakers/new" className="text-blue-600 hover:underline">
                Add a speaker first →
              </Link>
            </>
          ) : availableSpeakers.length === 0 ? (
            "All speakers in your library are already linked to this session."
          ) : (
            `Pick from ${availableSpeakers.length} available speaker${availableSpeakers.length > 1 ? "s" : ""}.`
          )}
        </p>
        {availableSpeakers.length > 0 && (
          <LinkSpeakerForm sessionId={id} speakers={availableSpeakers} />
        )}
      </div>
    </div>
  );
}
