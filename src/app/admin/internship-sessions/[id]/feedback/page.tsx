import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import {
  getFeedbackForSession,
  deleteAllFeedbackForStudent,
} from "@/lib/actions/feedback";
import { getInternshipSessionWithCompanies } from "@/lib/actions/internships";
import { PageHeader } from "@/components/admin/PageHeader";
import { DeleteRegistrationButton } from "@/components/admin/DeleteRegistrationButton";

function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default async function FeedbackOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const [session, rows] = await Promise.all([
    getInternshipSessionWithCompanies(id),
    getFeedbackForSession(id),
  ]);
  if (!session) notFound();

  const totalRegs = rows.length;
  const withAnyFeedback = rows.filter((r) => Number(r.section2Count) > 0).length;
  const withCompleteFeedback = rows.filter((r) => Number(r.completeCount) > 0).length;

  return (
    <div>
      <PageHeader
        title={`Feedback: ${session.title}`}
        subtitle={`${withCompleteFeedback} of ${totalRegs} students have a complete feedback (any internship); ${withAnyFeedback} have at least started`}
        backHref={`/admin/internship-sessions/${id}`}
        backLabel="Back to Session"
        action={
          <a
            href={`/admin/internship-sessions/${id}/feedback/export`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            Export CSV
          </a>
        }
      />

      <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-medium">Public feedback link</p>
          <p className="text-blue-800 font-mono break-all">
            https://hpsoyster.com/feedback/{session.slug}
          </p>
        </div>
        <a
          href={`/feedback/${session.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 whitespace-nowrap"
        >
          Open ↗
        </a>
      </div>

      {totalRegs === 0 ? (
        <p className="text-gray-500 bg-white border rounded-lg p-12 text-center">
          No registrations in this session yet.
        </p>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 w-12">#</th>
                <th className="px-4 py-3 font-medium text-gray-500">Student</th>
                <th className="px-4 py-3 font-medium text-gray-500">Class</th>
                <th className="px-4 py-3 font-medium text-gray-500">Roll #</th>
                <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-500">Internships reviewed</th>
                <th className="px-4 py-3 font-medium text-gray-500">Complete feedback</th>
                <th className="px-4 py-3 font-medium text-gray-500">In progress</th>
                <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Last update</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r, i) => (
                <tr key={r.key}>
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">{r.studentName}</td>
                  <td className="px-4 py-3">{r.classSection}</td>
                  <td className="px-4 py-3">{r.rollNumber}</td>
                  <td className="px-4 py-3">{r.parentEmail}</td>
                  <td className="px-4 py-3">{r.parentPhone}</td>
                  <td className="px-4 py-3">
                    {r.internships.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <ul className="space-y-0.5 text-xs">
                        {r.internships.map((it, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{it.companyName}</span>
                            {it.internshipDate && (
                              <span className="text-gray-500"> · {fmtDate(it.internshipDate)}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {Number(r.completeCount) > 0 ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        ✓ {Number(r.completeCount)} internship
                        {Number(r.completeCount) === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {Number(r.section2Count) - Number(r.completeCount) > 0 ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                        ⌛ {Number(r.section2Count) - Number(r.completeCount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {r.lastUpdatedAt
                      ? new Date(r.lastUpdatedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Kolkata",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {Number(r.section2Count) > 0 && (
                        <Link
                          href={`/admin/internship-sessions/${id}/feedback/${encodeURIComponent(`${r.classSection}__${r.rollNumber}`)}`}
                          className="text-xs text-blue-600 hover:underline px-2"
                        >
                          View
                        </Link>
                      )}
                      <DeleteRegistrationButton
                        studentName={`${r.studentName}'s feedback (${r.internships.length} ${
                          r.internships.length === 1 ? "entry" : "entries"
                        })`}
                        onDelete={async () => {
                          "use server";
                          await deleteAllFeedbackForStudent(
                            id,
                            r.classSection,
                            r.rollNumber
                          );
                        }}
                      />
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
