"use client";

import { useActionState, useEffect, useState } from "react";
import {
  feedbackEntry,
  type FeedbackPhase,
  type BoardCompany,
} from "@/lib/actions/feedback";

const VIEW_CHANGE = [
  { value: "very_strongly", label: "Very Strongly" },
  { value: "strongly", label: "Strongly" },
  { value: "slightly", label: "Slightly" },
  { value: "not_at_all", label: "Not at all" },
];
const LEARNING = [
  { value: "extremely", label: "Extremely valuable" },
  { value: "very", label: "Very valuable" },
  { value: "somewhat", label: "Somewhat valuable" },
  { value: "slightly", label: "Slightly valuable" },
  { value: "not_valuable", label: "Not valuable at all" },
];
const CLARITY = [
  { value: "yes_definitely", label: "Yes, definitely" },
  { value: "somewhat", label: "Somewhat" },
  { value: "not_really", label: "Not really" },
  { value: "did_not_help", label: "Did not help / confused" },
];
const ORG = [
  { value: "very_satisfied", label: "Very satisfied" },
  { value: "satisfied", label: "Satisfied" },
  { value: "neutral", label: "Neutral" },
  { value: "dissatisfied", label: "Dissatisfied" },
  { value: "very_dissatisfied", label: "Very dissatisfied" },
];
const ENCOURAGE = [
  { value: "definitely_will", label: "Definitely will" },
  { value: "probably_will", label: "Probably will" },
  { value: "maybe", label: "Maybe" },
  { value: "probably_not", label: "Probably will not" },
  { value: "definitely_not", label: "Definitely will not" },
];

type View = "board" | { kind: "company"; scId: string };

export function FeedbackForm({ sessionId }: { sessionId: string }) {
  const [state, formAction, pending] = useActionState<FeedbackPhase | null, FormData>(
    feedbackEntry,
    null
  );
  const [view, setView] = useState<View>("board");

  // After any successful submit, server returns the board state again. Reset
  // the focused view so we land back on the dashboard.
  useEffect(() => {
    if (state?.phase === "board" && !state.error) {
      setView("board");
    }
  }, [state]);

  // ── Lookup phase ─────────────────────────────────────────────────────
  if (!state || state.phase === "lookup") {
    return (
      <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
        <input type="hidden" name="intent" value="lookup" />
        <input type="hidden" name="sessionId" value={sessionId} />
        <h2 className="text-lg font-bold">Verify your details</h2>
        <p className="text-sm text-gray-600">
          Enter the class and roll number you used during registration.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class / Section <span className="text-red-500">*</span>
            </label>
            <input
              name="classSection"
              required
              placeholder="e.g. 10D"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number <span className="text-red-500">*</span>
            </label>
            <input
              name="rollNumber"
              required
              placeholder="e.g. 22"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        {state?.phase === "lookup" && state.error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition disabled:opacity-50"
        >
          {pending ? "Looking up..." : "Continue"}
        </button>
      </form>
    );
  }

  // ── Per-company form ─────────────────────────────────────────────────
  if (typeof view === "object" && view.kind === "company") {
    const company = state.eligibleCompanies.find((c) => c.sessionCompanyId === view.scId);
    if (!company) {
      setView("board");
      return null;
    }
    return (
      <CompanyForm
        sessionId={state.sessionId}
        registrationId={state.registration.id}
        company={company}
        formAction={formAction}
        pending={pending}
        onBack={() => setView("board")}
        error={state.error}
      />
    );
  }

  // ── Board view (default) ─────────────────────────────────────────────
  const reviewed = state.eligibleCompanies.filter((c) => c.feedback).length;
  const allDone =
    state.eligibleCompanies.length > 0 && reviewed === state.eligibleCompanies.length;

  return (
    <div className="space-y-5">
      <div className="bg-white border rounded-lg p-5">
        <p className="text-sm text-gray-500">Welcome,</p>
        <h2 className="text-xl font-bold">{state.registration.studentName}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {state.registration.classSection} · Roll {state.registration.rollNumber}
        </p>
      </div>

      {state.flash && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
          {state.flash}
        </p>
      )}

      {allDone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center">
          <p className="text-emerald-800 font-bold text-lg mb-1">
            🎉 All feedback complete
          </p>
          <p className="text-emerald-700 text-sm">
            You&apos;re eligible for the participation certificate. Thanks for sharing your
            experience — you can still update any answer if you want.
          </p>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-sm text-gray-700">Internships</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Click &quot;Give feedback&quot; only for the internships your child actually
            attended. {state.eligibleCompanies.length === 0
              ? "None of the internships in this session have happened yet."
              : `${reviewed} of ${state.eligibleCompanies.length} reviewed.`}
          </p>
        </div>
        {state.eligibleCompanies.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500 italic text-center">
            Once any internship date passes, it&apos;ll show up here for feedback.
          </p>
        ) : (
          <ul className="divide-y">
            {state.eligibleCompanies.map((c) => (
              <li key={c.sessionCompanyId} className="px-5 py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.sector}</p>
                  {c.feedback ? (
                    <p className="text-xs text-emerald-700 mt-1">
                      ✓ Submitted{" "}
                      {new Date(c.feedback.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">⌛ Not submitted</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setView({ kind: "company", scId: c.sessionCompanyId })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    c.feedback
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-primary text-white hover:bg-primary-light"
                  }`}
                >
                  {c.feedback ? "Edit" : "Give feedback"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Single-internship form (includes section-3 questions per internship) ──

function CompanyForm({
  sessionId,
  registrationId,
  company,
  formAction,
  pending,
  onBack,
  error,
}: {
  sessionId: string;
  registrationId: string;
  company: BoardCompany;
  formAction: (formData: FormData) => void;
  pending: boolean;
  onBack: () => void;
  error?: string;
}) {
  const pre = company.feedback;
  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-5">
      <input type="hidden" name="intent" value="submit_company" />
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="registrationId" value={registrationId} />
      <input type="hidden" name="sessionCompanyId" value={company.sessionCompanyId} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Internship</p>
          <h2 className="text-lg font-bold">{company.name}</h2>
          <p className="text-xs text-gray-500">{company.sector}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>

      {company.internshipDates && company.internshipDates.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date attended <span className="text-red-500">*</span>
          </label>
          <select
            name="internshipDate"
            required
            defaultValue={pre?.internshipDate ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Pick the date you attended...</option>
            {company.internshipDates.map((d) => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                })}
              </option>
            ))}
          </select>
        </div>
      )}
      {company.internshipDates && company.internshipDates.length === 1 && (
        <input type="hidden" name="internshipDate" value={company.internshipDates[0]} />
      )}

      <RatingScale
        label="How interactive was this internship?"
        name="interactivityRating"
        leftLabel="Not so interactive"
        rightLabel="Highly interactive"
        defaultValue={pre?.interactivityRating}
      />
      <RatingScale
        label="How would you rate the coaches/speakers?"
        name="speakerRating"
        leftLabel="Poor"
        rightLabel="Excellent"
        defaultValue={pre?.speakerRating}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What was your child&apos;s key takeaway? <span className="text-red-500">*</span>
        </label>
        <textarea
          name="keyTakeaway"
          required
          rows={3}
          defaultValue={pre?.keyTakeaway ?? ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <RadioGroup
        label='"This internship changed my kid&apos;s views about this field / career"'
        name="viewChangeLevel"
        options={VIEW_CHANGE}
        defaultValue={pre?.viewChangeLevel}
      />
      <RadioGroup
        label="How valuable was this internship for your child&apos;s overall learning?"
        name="learningValue"
        options={LEARNING}
        defaultValue={pre?.learningValue}
      />
      <RadioGroup
        label="Did this internship help your child get more clarity on what subjects to choose after 10th grade?"
        name="subjectClarity"
        options={CLARITY}
        defaultValue={pre?.subjectClarity}
      />

      <hr />
      <p className="text-sm font-medium text-gray-700">A bit about the program overall</p>

      <RadioGroup
        label="How satisfied are you with the overall organization (communication, logistics, guidance)?"
        name="organizationSatisfaction"
        options={ORG}
        defaultValue={pre?.organizationSatisfaction ?? undefined}
      />
      <RadioGroup
        label="How likely are you to encourage your child to apply for more Oyster internships in the future?"
        name="encourageMore"
        options={ENCOURAGE}
        defaultValue={pre?.encourageMore ?? undefined}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          One thing the student liked, and one thing that can be done better.{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          name="likedAndBetter"
          required
          rows={3}
          defaultValue={pre?.likedAndBetter ?? ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Any suggestions to make the Oyster program more impactful?{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          name="suggestions"
          rows={3}
          defaultValue={pre?.suggestions ?? ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save Feedback"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Shared widgets ─────────────────────────────────────────────────────

function RatingScale({
  label,
  name,
  leftLabel,
  rightLabel,
  defaultValue,
}: {
  label: string;
  name: string;
  leftLabel: string;
  rightLabel: string;
  defaultValue?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
        <span>{leftLabel}</span>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="flex flex-col items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name={name}
                value={n}
                required
                defaultChecked={defaultValue === n}
                className="w-4 h-4"
              />
              <span>{n}</span>
            </label>
          ))}
        </div>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function RadioGroup({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <span dangerouslySetInnerHTML={{ __html: label }} />{" "}
        <span className="text-red-500">*</span>
      </label>
      <div className="space-y-1.5">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              required
              defaultChecked={defaultValue === o.value}
              className="w-4 h-4"
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
