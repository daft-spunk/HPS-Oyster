import Link from "next/link";
import { getFeedbackEligibleSession } from "@/lib/actions/feedback";
import { getInternshipSessionWithCompanies } from "@/lib/actions/internships";
import { PublicNavbar } from "@/components/PublicNavbar";
import { FeedbackForm } from "./FeedbackForm";
import { formatTargetClass } from "@/lib/format";

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: requestedSessionId } = await searchParams;

  // Pick session: explicit ?session=… if given, else newest active session
  // that has at least one past-date internship.
  let sessionId = requestedSessionId ?? null;
  if (!sessionId) {
    const s = await getFeedbackEligibleSession();
    sessionId = s?.id ?? null;
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen">
        <PublicNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Internship Feedback</h1>
          <p className="text-gray-600">
            No internship has happened yet. Once your internship date passes, this
            page will open up so you can share your experience.
          </p>
          <Link href="/" className="text-primary hover:underline mt-6 inline-block">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const session = await getInternshipSessionWithCompanies(sessionId);
  if (!session) {
    return (
      <div className="min-h-screen">
        <PublicNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Session not found</h1>
          <Link href="/" className="text-primary hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {formatTargetClass(session.targetClass)} &mdash; {session.title}
          </h1>
          <p className="text-gray-500">Feedback Form</p>
        </div>
        <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Thank you for supporting the HPS World is My Oyster Internship Program.
          We&apos;d love to hear your feedback on your child&apos;s recent internship
          experience. Your inputs help us shape the program. <strong>Feedback is required
          to be eligible for the internship participation certificate.</strong>
        </div>
        <FeedbackForm sessionId={sessionId} />
      </div>
    </div>
  );
}
