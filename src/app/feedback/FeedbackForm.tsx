"use client";

import { useActionState, useState } from "react";
import { feedbackEntry, type FeedbackPhase } from "@/lib/actions/feedback";

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

export function FeedbackForm({ sessionId }: { sessionId: string }) {
  const [state, formAction, pending] = useActionState<FeedbackPhase | null, FormData>(
    feedbackEntry,
    null
  );

  // Lookup phase
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

  if (state.phase === "done") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-700 font-bold text-xl mb-2">Thank you!</p>
        <p className="text-green-700 text-sm">
          Your feedback has been recorded. You&apos;ll be eligible for the
          participation certificate. We appreciate the time you took to share this.
        </p>
      </div>
    );
  }

  // Fill phase
  return <FillForm state={state} formAction={formAction} pending={pending} />;
}

function FillForm({
  state,
  formAction,
  pending,
}: {
  state: Extract<FeedbackPhase, { phase: "fill" }>;
  formAction: (formData: FormData) => void;
  pending: boolean;
}) {
  // Tracks which companies the student ticks as "attended"
  const initiallyTicked = new Set(Object.keys(state.prefill));
  const [ticked, setTicked] = useState<Record<string, boolean>>(
    Object.fromEntries(state.eligibleCompanies.map((c) => [c.sessionCompanyId, initiallyTicked.has(c.sessionCompanyId)]))
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="intent" value="submit" />
      <input type="hidden" name="sessionId" value={state.sessionId} />
      <input type="hidden" name="registrationId" value={state.registration.id} />

      {/* Section 1: who is this */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-3">
          Hi {state.registration.studentName} 👋
        </h2>
        <div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500">Class:</span>{" "}
            <span className="font-medium">{state.registration.classSection}</span>
          </div>
          <div>
            <span className="text-gray-500">Roll:</span>{" "}
            <span className="font-medium">{state.registration.rollNumber}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Parent:</span>{" "}
            <span className="font-medium">{state.registration.parentName}</span>{" "}
            <span className="text-gray-400">
              ({state.registration.parentEmail} · {state.registration.parentPhone})
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: per-internship */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-1">Internship Experience</h2>
        <p className="text-sm text-gray-600 mb-4">
          Tick the internships your child actually attended. Answer the questions
          for each one.
        </p>

        {state.eligibleCompanies.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            None of the internships in this session have happened yet.
          </p>
        ) : (
          <div className="space-y-4">
            {state.eligibleCompanies.map((c) => {
              const isTicked = ticked[c.sessionCompanyId] ?? false;
              const pre = state.prefill[c.sessionCompanyId];
              return (
                <div
                  key={c.sessionCompanyId}
                  className={`border rounded-lg ${isTicked ? "border-primary" : "border-gray-200"}`}
                >
                  <label className="flex items-start gap-3 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      name={`ticked_${c.sessionCompanyId}`}
                      checked={isTicked}
                      onChange={(e) =>
                        setTicked((t) => ({ ...t, [c.sessionCompanyId]: e.target.checked }))
                      }
                      className="mt-1 w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.sector}</p>
                    </div>
                  </label>

                  {isTicked && (
                    <div className="border-t px-4 py-4 space-y-5 bg-gray-50">
                      {/* Date (if multiple) */}
                      {c.internshipDates && c.internshipDates.length > 1 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date attended <span className="text-red-500">*</span>
                          </label>
                          <select
                            name={`sc_${c.sessionCompanyId}_date`}
                            required
                            defaultValue={pre?.internshipDate ?? ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Pick the date you attended...</option>
                            {c.internshipDates.map((d) => (
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
                      {c.internshipDates && c.internshipDates.length === 1 && (
                        <input
                          type="hidden"
                          name={`sc_${c.sessionCompanyId}_date`}
                          value={c.internshipDates[0]}
                        />
                      )}

                      <RatingScale
                        label="How interactive was this internship?"
                        name={`sc_${c.sessionCompanyId}_interactivity`}
                        leftLabel="Not so interactive"
                        rightLabel="Highly interactive"
                        defaultValue={pre?.interactivityRating}
                      />
                      <RatingScale
                        label="How would you rate the coaches/speakers?"
                        name={`sc_${c.sessionCompanyId}_speaker`}
                        leftLabel="Poor"
                        rightLabel="Excellent"
                        defaultValue={pre?.speakerRating}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          What was your child&apos;s key takeaway?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name={`sc_${c.sessionCompanyId}_takeaway`}
                          required
                          rows={3}
                          defaultValue={pre?.keyTakeaway ?? ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <RadioGroup
                        label="&quot;This internship changed my kid&apos;s views about this field / career&quot;"
                        name={`sc_${c.sessionCompanyId}_viewChange`}
                        options={VIEW_CHANGE}
                        defaultValue={pre?.viewChangeLevel}
                      />
                      <RadioGroup
                        label="How valuable was this internship for your child&apos;s overall learning?"
                        name={`sc_${c.sessionCompanyId}_learning`}
                        options={LEARNING}
                        defaultValue={pre?.learningValue}
                      />
                      <RadioGroup
                        label="Did this internship help your child get more clarity on what subjects to choose after 10th grade?"
                        name={`sc_${c.sessionCompanyId}_clarity`}
                        options={CLARITY}
                        defaultValue={pre?.subjectClarity}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: overall */}
      <div className="bg-white border rounded-lg p-6 space-y-5">
        <h2 className="text-lg font-bold">Overall Rating</h2>
        <RadioGroup
          label="How satisfied are you with the overall organization (communication, logistics, guidance)?"
          name="organizationSatisfaction"
          options={ORG}
          defaultValue={state.sessionPrefill.organizationSatisfaction ?? undefined}
        />
        <RadioGroup
          label="How likely are you to encourage your child to apply for more Oyster internships in the future?"
          name="encourageMore"
          options={ENCOURAGE}
          defaultValue={state.sessionPrefill.encourageMore ?? undefined}
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
            defaultValue={state.sessionPrefill.likedAndBetter ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Any suggestions to make the Oyster program more impactful?{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            name="suggestions"
            required
            rows={3}
            defaultValue={state.sessionPrefill.suggestions ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}

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
