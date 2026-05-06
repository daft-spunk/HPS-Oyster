import { getInternshipSessionWithCompanies } from "@/lib/actions/internships";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ManualEntryForm } from "./ManualEntryForm";
import { CsvUploadForm } from "./CsvUploadForm";

export default async function AddInternshipRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const session = await getInternshipSessionWithCompanies(id);
  if (!session) notFound();

  const companies = session.companies.map((c) => ({
    sessionCompanyId: c.sessionCompanyId,
    name: c.name,
    sector: c.sector,
  }));

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Add Registrations"
        subtitle={`Manually enter a single registration or upload a CSV in the legacy export format.`}
        backHref={`/admin/internship-sessions/${id}/registrations`}
        backLabel="Back to Registrations"
      />

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Single registration
        </h2>
        <ManualEntryForm sessionId={id} companies={companies} maxPreferences={session.maxPreferences} />
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">CSV upload</h2>
        <p className="text-xs text-gray-500 mb-4">
          Upload an export from the old <code>hpsoyster.com/form.php</code> system, or any CSV
          with these columns:&nbsp;
          <code>Date</code>, <code>Name of the Student</code>, <code>Class/Section</code>,
          <code>Roll Number</code>, <code>Parent Name</code>, <code>Parent Email Id</code>,
          <code>Parent Phone Number</code>, <code>Child s general interests</code>,
          <code>Internship 1</code>, <code>Internship 2</code>, <code>Internship 3</code>.
          Each Internship cell should look like
          <em> &ldquo;Continental Coffee, 22nd May 2026 - reason text&rdquo;</em>.
          Companies are matched by name to whatever sponsors are linked to this session.
        </p>
        <CsvUploadForm sessionId={id} />
      </div>
    </div>
  );
}
