import { notFound } from "next/navigation";
import { getInternshipSessionBySlug } from "@/lib/actions/internships";
import { getInitialBoard } from "@/lib/actions/feedback";
import { PublicNavbar } from "@/components/PublicNavbar";
import { FeedbackForm } from "../FeedbackForm";
import { formatTargetClass } from "@/lib/format";

export default async function FeedbackSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getInternshipSessionBySlug(slug);
  if (!session) notFound();
  const initialBoard = await getInitialBoard(session.id);

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
          Thank you for supporting the HPS World is My Oyster Internship Program. We&apos;d
          love to hear your feedback on your child&apos;s recent internship experience.
          Your inputs help us shape the program.{" "}
          <strong>Feedback is required to be eligible for the internship participation
          certificate.</strong>
        </div>
        <FeedbackForm sessionId={session.id} initialBoard={initialBoard} />
      </div>
    </div>
  );
}
