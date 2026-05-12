import { getInternshipSessionWithCompanies, removeCompanyFromSession, toggleSessionCompanyActive } from "@/lib/actions/internships";
import { getAllCompanies } from "@/lib/actions/library";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { LinkCompanyForm } from "./LinkCompanyForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmFormButton } from "@/components/admin/ConfirmFormButton";
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
        subtitle={`${formatTargetClass(session.targetClass)} · ${session.editionLabel}${session.regDeadline ? ` · Deadline ${new Date(session.regDeadline).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}` : ""}`}
        backHref="/admin/internship-sessions"
        backLabel="Back to Internship Sessions"
        action={
          <div className="flex gap-2 flex-wrap">
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
              Registrations
            </Link>
            <Link
              href={`/admin/internship-sessions/${id}/feedback`}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              Feedback
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
                  <th className="px-4 py-3 font-medium text-gray-500">Regs</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Order</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {session.companies.map((c) => (
                  <tr key={c.sessionCompanyId} className={c.isActive ? "" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium">
                      <span className={c.isActive ? "" : "text-gray-400"}>{c.name}</span>
                      {!c.isActive && (
                        <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{c.sector}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {c.internshipDates && c.internshipDates.length > 0
                        ? c.internshipDates.join(", ")
                        : "TBD"}
                    </td>
                    <td className="px-4 py-3">{c.slotsAvailable}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="font-medium">{Number(c.registrationCount)}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({Number(c.pref1Count)} as #1, {Number(c.pref2Count)} as #2, {Number(c.pref3Count)} as #3)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.displayOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-3 items-center">
                        <form
                          action={toggleSessionCompanyActive.bind(null, c.sessionCompanyId, id)}
                          className="inline"
                        >
                          {c.isActive ? (
                            <ConfirmFormButton
                              message={`Deactivate ${c.name}? It will be hidden from public registration but its details will be kept so you can reactivate later.`}
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
                          href={`/admin/internship-sessions/${id}/companies/${c.sessionCompanyId}/edit`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <form
                          action={removeCompanyFromSession.bind(null, c.sessionCompanyId, id)}
                          className="inline"
                        >
                          <ConfirmFormButton
                            message={`Remove ${c.name} from this session? All details (about, who-for, what-to-expect, etc.) will be lost. Use Deactivate instead if you only want to hide it temporarily.`}
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
