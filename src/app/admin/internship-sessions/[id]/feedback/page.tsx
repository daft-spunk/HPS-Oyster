import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getFeedbackForSession } from "@/lib/actions/feedback";
import { getInternshipSessionWithCompanies } from "@/lib/actions/internships";
import { PageHeader } from "@/components/admin/PageHeader";

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
  const withCompanyFeedback = rows.filter((r) => Number(r.companyFeedbackCount) > 0).length;
  const withSessionFeedback = rows.filter((r) => r.sessionFeedbackSubmitted).length;

  return (
    <div>
      <PageHeader
        title={`Feedback: ${session.title}`}
        subtitle={`${withCompanyFeedback} of ${totalRegs} students have submitted internship feedback · ${withSessionFeedback} session-level submissions`}
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
                <th className="px-4 py-3 font-medium text-gray-500">Companies reviewed</th>
                <th className="px-4 py-3 font-medium text-gray-500">Overall</th>
                <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Last update</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">{r.studentName}</td>
                  <td className="px-4 py-3">{r.classSection}</td>
                  <td className="px-4 py-3">{r.rollNumber}</td>
                  <td className="px-4 py-3">{r.parentEmail}</td>
                  <td className="px-4 py-3">{r.parentPhone}</td>
                  <td className="px-4 py-3">
                    {Number(r.companyFeedbackCount) > 0 ? (
                      <span className="font-medium text-green-700">
                        {Number(r.companyFeedbackCount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.sessionFeedbackSubmitted ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        ✓ Done
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {r.lastFeedbackAt
                      ? new Date(r.lastFeedbackAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Kolkata",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {Number(r.companyFeedbackCount) > 0 || r.sessionFeedbackSubmitted ? (
                      <Link
                        href={`/admin/internship-sessions/${id}/feedback/${r.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
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
