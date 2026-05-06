import { getTalkRegistrations, getSessionWithSpeakers, deleteTalkRegistration } from "@/lib/actions/talks";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { DeleteRegistrationButton } from "@/components/admin/DeleteRegistrationButton";

export default async function TalkRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const [session, registrations] = await Promise.all([
    getSessionWithSpeakers(id),
    getTalkRegistrations(id),
  ]);
  if (!session) notFound();

  return (
    <div>
      <PageHeader
        title={`Registrations: ${session.title}`}
        subtitle={`${registrations.length} registrations`}
        backHref={`/admin/talk-sessions/${id}`}
        backLabel="Back to Session"
        action={
          <a
            href={`/admin/talk-sessions/${id}/registrations/export`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            Export CSV
          </a>
        }
      />

      {registrations.length === 0 ? (
        <p className="text-gray-500 bg-white border rounded-lg p-12 text-center">
          No registrations yet.
        </p>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 w-12">#</th>
                <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Registered At</th>
                <th className="px-4 py-3 font-medium text-gray-500">Student</th>
                <th className="px-4 py-3 font-medium text-gray-500">Class</th>
                <th className="px-4 py-3 font-medium text-gray-500">Roll #</th>
                <th className="px-4 py-3 font-medium text-gray-500">Speaker</th>
                <th className="px-4 py-3 font-medium text-gray-500">Parent</th>
                <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {registrations.map((r, i) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{r.studentName}</td>
                  <td className="px-4 py-3">{r.classSection}</td>
                  <td className="px-4 py-3">{r.rollNumber}</td>
                  <td className="px-4 py-3">{r.speakerName}</td>
                  <td className="px-4 py-3">{r.parentName}</td>
                  <td className="px-4 py-3">{r.parentEmail}</td>
                  <td className="px-4 py-3">{r.parentPhone}</td>
                  <td className="px-4 py-3 text-right">
                    <DeleteRegistrationButton
                      studentName={r.studentName}
                      onDelete={deleteTalkRegistration.bind(null, r.id, id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
