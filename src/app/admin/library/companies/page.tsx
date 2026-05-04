import Link from "next/link";
import { getAllCompanies, deleteCompany } from "@/lib/actions/library";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmFormButton } from "@/components/admin/ConfirmFormButton";

export default async function CompaniesLibraryPage() {
  const companies = await getAllCompanies();

  return (
    <div>
      <PageHeader
        title="Companies Library"
        subtitle="Reusable pool of host companies. Add once, use across many internship sessions."
        action={
          <Link
            href="/admin/library/companies/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            + Add Company
          </Link>
        }
      />

      {companies.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500 mb-4">No companies in the library yet.</p>
          <Link
            href="/admin/library/companies/new"
            className="text-blue-600 hover:underline text-sm"
          >
            Add your first company →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Company</th>
                <th className="px-4 py-3 font-medium text-gray-500">Sector</th>
                <th className="px-4 py-3 font-medium text-gray-500">Last Hosted</th>
                <th className="px-4 py-3 font-medium text-gray-500">Used in</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {companies.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/library/companies/${c.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.sector}</td>
                  <td className="px-4 py-3 text-gray-500">{c.lastUsedTitle || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {Number(c.timesUsed) > 0
                      ? `${Number(c.timesUsed)} session${Number(c.timesUsed) > 1 ? "s" : ""}`
                      : "Not yet used"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/library/companies/${c.id}`}
                      className="px-2 py-1 text-xs border rounded hover:bg-gray-50 mr-2"
                    >
                      Edit
                    </Link>
                    <form action={deleteCompany.bind(null, c.id)} className="inline">
                      <ConfirmFormButton
                        message={`Permanently delete ${c.name} from the company library? This cannot be undone. (Companies used in past sessions cannot be deleted.)`}
                        className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
                      >
                        Delete
                      </ConfirmFormButton>
                    </form>
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
