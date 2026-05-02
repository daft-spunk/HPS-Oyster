import Link from "next/link";
import {
  getAllTalkSessions,
  toggleTalkActive,
  toggleTalkRegOpen,
  deleteTalkSession,
} from "@/lib/actions/talks";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function TalkSessionsPage() {
  const sessions = await getAllTalkSessions();

  return (
    <div>
      <PageHeader
        title="Talk Sessions"
        subtitle="Quarterly Role Model Talks for Class 9 and Class 10. Each session links speakers from your Library."
        action={
          <Link
            href="/admin/talk-sessions/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            + New Session
          </Link>
        }
      />

      {sessions.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500 mb-2">No talk sessions yet.</p>
          <p className="text-sm text-gray-400 mb-4">
            Tip: Add speakers to your Library first, then create a session and link them.
          </p>
          <Link
            href="/admin/talk-sessions/new"
            className="text-blue-600 hover:underline text-sm"
          >
            Create your first session →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500">Class</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Speakers</th>
                <th className="px-4 py-3 font-medium text-gray-500">Regs</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/talk-sessions/${s.id}`} className="text-blue-600 hover:underline font-medium">
                      {s.title}
                    </Link>
                    <div className="text-xs text-gray-400">{s.editionLabel}</div>
                  </td>
                  <td className="px-4 py-3">Class {s.targetClass}</td>
                  <td className="px-4 py-3 text-gray-500">{s.sessionDate || "TBD"}</td>
                  <td className="px-4 py-3">{Number(s.speakerCount)}</td>
                  <td className="px-4 py-3">{Number(s.registrationCount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {s.isActive ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium w-fit">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium w-fit">
                          Inactive
                        </span>
                      )}
                      {s.regOpen ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium w-fit">
                          Reg Open
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium w-fit">
                          Reg Closed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1 flex-wrap">
                      <form action={toggleTalkActive.bind(null, s.id)} className="inline">
                        <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">
                          {s.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                      <form action={toggleTalkRegOpen.bind(null, s.id)} className="inline">
                        <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">
                          {s.regOpen ? "Close Reg" : "Open Reg"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/talk-sessions/${s.id}/registrations`}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                      >
                        Regs ({Number(s.registrationCount)})
                      </Link>
                      <form action={deleteTalkSession.bind(null, s.id)} className="inline">
                        <button className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">
                          Delete
                        </button>
                      </form>
                    </div>
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
