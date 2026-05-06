import { db } from "@/lib/db";
import { sessionCompanies, companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EditSessionCompanyForm } from "./EditSessionCompanyForm";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function EditSessionCompanyPage({
  params,
}: {
  params: Promise<{ id: string; scId: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id: sessionId, scId } = await params;

  const [row] = await db
    .select({
      id: sessionCompanies.id,
      sessionId: sessionCompanies.sessionId,
      companyName: companies.name,
      internshipDates: sessionCompanies.internshipDates,
      slotsAvailable: sessionCompanies.slotsAvailable,
      displayOrder: sessionCompanies.displayOrder,
      aboutInternship: sessionCompanies.aboutInternship,
      whoFor: sessionCompanies.whoFor,
      whatToExpect: sessionCompanies.whatToExpect,
      whatToBring: sessionCompanies.whatToBring,
    })
    .from(sessionCompanies)
    .innerJoin(companies, eq(sessionCompanies.companyId, companies.id))
    .where(eq(sessionCompanies.id, scId));
  if (!row || row.sessionId !== sessionId) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Edit Internship – ${row.companyName}`}
        subtitle="Update what students see for this company in this session."
        backHref={`/admin/internship-sessions/${sessionId}`}
        backLabel="Back to Session"
      />
      <EditSessionCompanyForm
        sessionId={sessionId}
        sessionCompany={{
          id: row.id,
          internshipDates: row.internshipDates,
          slotsAvailable: row.slotsAvailable,
          displayOrder: row.displayOrder,
          aboutInternship: row.aboutInternship,
          whoFor: row.whoFor,
          whatToExpect: row.whatToExpect,
          whatToBring: row.whatToBring,
        }}
      />
    </div>
  );
}
