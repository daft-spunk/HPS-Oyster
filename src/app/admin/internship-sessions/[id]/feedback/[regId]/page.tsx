import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getFeedbackDetail } from "@/lib/actions/feedback";
import { PageHeader } from "@/components/admin/PageHeader";

const VIEW_LABELS: Record<string, string> = {
  very_strongly: "Very Strongly",
  strongly: "Strongly",
  slightly: "Slightly",
  not_at_all: "Not at all",
};
const LEARNING_LABELS: Record<string, string> = {
  extremely: "Extremely valuable",
  very: "Very valuable",
  somewhat: "Somewhat valuable",
  slightly: "Slightly valuable",
  not_valuable: "Not valuable at all",
};
const CLARITY_LABELS: Record<string, string> = {
  yes_definitely: "Yes, definitely",
  somewhat: "Somewhat",
  not_really: "Not really",
  did_not_help: "Did not help / confused",
};
const ORG_LABELS: Record<string, string> = {
  very_satisfied: "Very satisfied",
  satisfied: "Satisfied",
  neutral: "Neutral",
  dissatisfied: "Dissatisfied",
  very_dissatisfied: "Very dissatisfied",
};
const ENCOURAGE_LABELS: Record<string, string> = {
  definitely_will: "Definitely will",
  probably_will: "Probably will",
  maybe: "Maybe",
  probably_not: "Probably will not",
  definitely_not: "Definitely will not",
};

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string; regId: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id, regId } = await params;
  const detail = await getFeedbackDetail(regId);
  if (!detail || detail.registration.sessionId !== id) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Feedback – ${detail.registration.studentName}`}
        subtitle={`${detail.registration.classSection} · Roll ${detail.registration.rollNumber}`}
        backHref={`/admin/internship-sessions/${id}/feedback`}
        backLabel="Back to Feedback"
      />

      <div className="space-y-5">
        {detail.perCompany.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white border rounded-lg p-6">
            No per-company feedback submitted yet.
          </p>
        ) : (
          detail.perCompany.map((c) => (
            <div key={c.id} className="bg-white border rounded-lg p-5">
              <h3 className="font-bold text-base mb-1">{c.companyName}</h3>
              {c.internshipDate && (
                <p className="text-xs text-gray-500 mb-3">
                  Attended on{" "}
                  {new Date(c.internshipDate).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  })}
                </p>
              )}
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <Row label="Interactivity">{c.interactivityRating}/5</Row>
                <Row label="Coaches/Speakers">{c.speakerRating}/5</Row>
                <Row label="View change">{VIEW_LABELS[c.viewChangeLevel] ?? c.viewChangeLevel}</Row>
                <Row label="Learning value">{LEARNING_LABELS[c.learningValue] ?? c.learningValue}</Row>
                <Row label="Subject clarity">{CLARITY_LABELS[c.subjectClarity] ?? c.subjectClarity}</Row>
              </dl>
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                  Key takeaway
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.keyTakeaway}</p>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Submitted{" "}
                {new Date(c.updatedAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Kolkata",
                })}
              </p>
            </div>
          ))
        )}

        {detail.session ? (
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-bold text-base mb-3">Overall Rating</h3>
            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              <Row label="Organization">
                {ORG_LABELS[detail.session.organizationSatisfaction] ??
                  detail.session.organizationSatisfaction}
              </Row>
              <Row label="Encourage more">
                {ENCOURAGE_LABELS[detail.session.encourageMore] ?? detail.session.encourageMore}
              </Row>
            </dl>
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Liked / could be better
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {detail.session.likedAndBetter}
              </p>
            </div>
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Suggestions
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {detail.session.suggestions}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 bg-white border rounded-lg p-6">
            Section 3 (overall rating) not submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-800">{children}</dd>
    </div>
  );
}
