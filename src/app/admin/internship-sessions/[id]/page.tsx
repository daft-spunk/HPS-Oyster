import { getInternshipSessionWithCompanies, removeCompanyFromSession } from "@/lib/actions/internships";
import { getAllCompanies } from "@/lib/actions/library";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { LinkCompanyForm } from "./LinkCompanyForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatTargetClass } from "@/lib/format";

export default async function InternshipSessionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const [session, allCompanies] = await Promise.all([
    getInternshipSessionWithCompanies(id),
    getAllCompanies(),
  ]);
  if (!session) notFound();

  const linkedIds = new Set(session.companies.map((c) => c.companyId));
  const availableCompanies = allCompanies.filter((c) => !linkedIds.has(c.id));

  return (
    <div>
      <PageHeader
        title={session.title}
        subtitle={`${formatTargetClass(session.targetClass)} · ${session.editionLabel}${session.regDeadline ? ` · Deadline ${new Date(session.regDeadline).toLocaleDateString()}` : ""}`}
        backHref="/admin/internship-sessions"
        backLabel="Back to Internship Sessions"
        action={
          <div className="flex gap-2">
            <Link
              href={`/admin/internship-sessions/${id}/edit`}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              Edit Details
            </Link>
            <Link
              href={`/admin/internship-sessions/${id}/registrations`}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              View Registrations
            </Link>
          </div>
        }
      />

      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Companies in this Session ({session.companies.length})
        </h2>
        {session.companies.length > 0 ? (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Company</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Sector</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Slots</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Order</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {session.companies.map((c) => (
                  <tr key={c.sessionCompanyId}>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-700">{c.sector}</td>
                    <td className="px-4 py-3 text-gray-500">{c.internshipDate || "TBD"}</td>
                    <td className="px-4 py-3">{c.slotsAvailable}</td>
                    <td className="px-4 py-3 text-gray-500">{c.displayOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-3 items-center">
                        <Link
                          href={`/admin/internship-sessions/${id}/companies/${c.sessionCompanyId}/edit`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <form
                          action={removeCompanyFromSession.bind(null, c.sessionCompanyId, id)}
                          className="inline"
                        >
                          <button className="text-xs text-red-600 hover:underline">
                            Remove
                          </button>
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
            No companies linked yet. Pick from your Library below to add some.
          </p>
        )}
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Link a Company from Library
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          {allCompanies.length === 0 ? (
            <>
              Your library is empty.{" "}
              <Link href="/admin/library/companies/new" className="text-blue-600 hover:underline">
                Add a company first →
              </Link>
            </>
          ) : availableCompanies.length === 0 ? (
            "All companies in your library are already linked to this session."
          ) : (
            `Pick from ${availableCompanies.length} available compan${availableCompanies.length > 1 ? "ies" : "y"}.`
          )}
        </p>
        {availableCompanies.length > 0 && (
          <LinkCompanyForm sessionId={id} companies={availableCompanies} />
        )}
      </div>
    </div>
  );
}
