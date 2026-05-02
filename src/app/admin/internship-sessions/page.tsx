import Link from "next/link";
import {
  getAllInternshipSessions,
  toggleInternshipActive,
  toggleInternshipRegOpen,
  deleteInternshipSession,
} from "@/lib/actions/internships";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatTargetClass } from "@/lib/format";

export default async function InternshipSessionsPage() {
  const sessions = await getAllInternshipSessions();

  return (
    <div>
      <PageHeader
        title="Internship Sessions"
        subtitle="Periodic internship batches. Each session links companies from your Library and collects student preferences."
        action={
          <Link
            href="/admin/internship-sessions/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            + New Session
          </Link>
        }
      />

      {sessions.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500 mb-2">No internship sessions yet.</p>
          <p className="text-sm text-gray-400 mb-4">
            Tip: Add companies to your Library first, then create a session and link them.
          </p>
          <Link
            href="/admin/internship-sessions/new"
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
                <th className="px-4 py-3 font-medium text-gray-500">Edition</th>
                <th className="px-4 py-3 font-medium text-gray-500">Deadline</th>
                <th className="px-4 py-3 font-medium text-gray-500">Companies</th>
                <th className="px-4 py-3 font-medium text-gray-500">Regs</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/internship-sessions/${s.id}`} className="text-blue-600 hover:underline font-medium">
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{formatTargetClass(s.targetClass)}</td>
                  <td className="px-4 py-3 text-gray-500">{s.editionLabel}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.regDeadline ? new Date(s.regDeadline).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">{Number(s.companyCount)}</td>
                  <td className="px-4 py-3">{Number(s.registrationCount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {s.isActive ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium w-fit">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium w-fit">Inactive</span>
                      )}
                      {s.regOpen ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium w-fit">Reg Open</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium w-fit">Reg Closed</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1 flex-wrap">
                      <form action={toggleInternshipActive.bind(null, s.id)} className="inline">
                        <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">
                          {s.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                      <form action={toggleInternshipRegOpen.bind(null, s.id)} className="inline">
                        <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">
                          {s.regOpen ? "Close Reg" : "Open Reg"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/internship-sessions/${s.id}/registrations`}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                      >
                        Regs ({Number(s.registrationCount)})
                      </Link>
                      <form action={deleteInternshipSession.bind(null, s.id)} className="inline">
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
