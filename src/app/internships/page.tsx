import Link from "next/link";
import {
  getActiveInternshipSession,
  getActiveInternshipSessionByClass,
  getInternshipSessionWithCompanies,
} from "@/lib/actions/internships";
import { InternshipRegistrationForm } from "./InternshipRegistrationForm";
import { InternshipDetails } from "./InternshipDetails";
import { PublicNavbar } from "@/components/PublicNavbar";
import { formatTargetClass } from "@/lib/format";

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const params = await searchParams;
  const requestedClass = params.class === "9" || params.class === "10" ? params.class : null;
  const activeSession = requestedClass
    ? await getActiveInternshipSessionByClass(requestedClass)
    : await getActiveInternshipSession();

  if (!activeSession) {
    return (
      <div className="min-h-screen">
        <PublicNavbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">1-Day Internships</h1>
          <p className="text-gray-600">
            No active 1-Day Internship program right now. Check back soon!
          </p>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const fullSession = await getInternshipSessionWithCompanies(activeSession.id);
  if (!fullSession) return null;
  // Hide inactive companies from public registration
  const session = {
    ...fullSession,
    companies: fullSession.companies.filter((c) => c.isActive),
  };

  const isRegOpen =
    session.regOpen &&
    (!session.regDeadline || new Date(session.regDeadline) > new Date());

  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">
            {formatTargetClass(session.targetClass)} — {session.title}
          </h1>
          <p className="text-gray-500 mb-1">{session.editionLabel}</p>
          {session.regDeadline && (
            <p className="text-sm text-orange-600 mt-3 font-medium">
              Registration deadline:{" "}
              {new Date(session.regDeadline).toLocaleString("en-IN", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
              })}
            </p>
          )}
        </div>

        {session.description && (
          <p className="text-gray-700 max-w-3xl mx-auto text-center leading-relaxed mb-8">
            {session.description}
          </p>
        )}

        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          This is an expression of interest. After the registration window closes,
          the program team will announce the list of selected students.
        </div>

        {/* Company Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {session.companies.map((company) => {
            const formattedDates = (company.internshipDates ?? [])
              .map((d) =>
                new Date(d).toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  timeZone: "Asia/Kolkata",
                })
              );
            return (
              <div
                key={company.sessionCompanyId}
                className="bg-white border rounded-lg p-5 flex flex-col"
              >
                <h3 className="font-bold text-lg mb-1">{company.name}</h3>
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium mb-3 self-start">
                  {company.sector}
                </span>
                <div className="mb-3 flex items-center gap-2 flex-wrap text-sm font-medium text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formattedDates.length > 0 ? (
                    formattedDates.map((d, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded"
                      >
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded italic">
                      To be announced
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {company.description}
                </p>

                <InternshipDetails
                  aboutInternship={company.aboutInternship}
                  whoFor={company.whoFor}
                  whatToExpect={company.whatToExpect}
                  whatToBring={company.whatToBring}
                />

                {company.websiteUrl && (
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-3"
                  >
                    Learn more about {company.name}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Registration Form */}
        {isRegOpen ? (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Register Your Interest</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select your top 3 preferred companies and explain why you are interested
              in each. You can only register once per session.
            </p>
            <InternshipRegistrationForm
              sessionId={session.id}
              maxPreferences={session.maxPreferences}
              companies={session.companies.map((c) => ({
                sessionCompanyId: c.sessionCompanyId,
                name: c.name,
                sector: c.sector,
              }))}
            />
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
            <p className="text-orange-700 font-medium">
              Registration for this session is closed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

