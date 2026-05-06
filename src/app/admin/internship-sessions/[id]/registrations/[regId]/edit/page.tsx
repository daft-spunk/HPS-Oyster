import {
  getInternshipRegistration,
  getInternshipSessionWithCompanies,
} from "@/lib/actions/internships";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { EditRegistrationForm } from "./EditRegistrationForm";

export default async function EditRegistrationPage({
  params,
}: {
  params: Promise<{ id: string; regId: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id: sessionId, regId } = await params;

  const [registration, session] = await Promise.all([
    getInternshipRegistration(regId),
    getInternshipSessionWithCompanies(sessionId),
  ]);
  if (!registration || !session || registration.sessionId !== sessionId) notFound();

  const companies = session.companies.map((c) => ({
    sessionCompanyId: c.sessionCompanyId,
    name: c.name,
    sector: c.sector,
  }));

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Edit Registration – ${registration.studentName}`}
        subtitle={`${registration.classSection} · Roll ${registration.rollNumber}`}
        backHref={`/admin/internship-sessions/${sessionId}/registrations`}
        backLabel="Back to Registrations"
      />
      <div className="bg-white border rounded-lg p-6">
        <EditRegistrationForm
          sessionId={sessionId}
          registrationId={regId}
          companies={companies}
          maxPreferences={session.maxPreferences}
          registration={{
            studentName: registration.studentName,
            classSection: registration.classSection,
            rollNumber: registration.rollNumber,
            parentName: registration.parentName,
            parentEmail: registration.parentEmail,
            parentPhone: registration.parentPhone,
            interests: registration.interests,
            pref1SessionCompanyId: registration.pref1SessionCompanyId,
            pref1Reason: registration.pref1Reason,
            pref2SessionCompanyId: registration.pref2SessionCompanyId,
            pref2Reason: registration.pref2Reason,
            pref3SessionCompanyId: registration.pref3SessionCompanyId,
            pref3Reason: registration.pref3Reason,
          }}
        />
      </div>
    </div>
  );
}
