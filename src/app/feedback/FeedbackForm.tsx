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

type Step = "personal" | "internships" | "ops";
type View = { step: Step } | { step: "internships"; focus: string };

export function FeedbackForm({ sessionId }: { sessionId: string }) {
  const [state, formAction, pending] = useActionState<FeedbackPhase | null, FormData>(
    feedbackEntry,
    null
  );
  const [view, setView] = useState<View>({ step: "personal" });

  // After lookup succeeds, start the wizard at personal step
  // After any successful submit, return to that step's home view (clear focus)
  useEffect(() => {
    if (state?.phase === "board" && !state.error) {
      setView((v) => {
        // If a flash exists, advance to the next step automatically
        if (state.flash === "Personal details saved.") return { step: "internships" };
        if (state.flash === "Program feedback saved.") return { step: "ops" };
        // For internship submits, drop the focus so we return to the list
        if (v.step === "internships" && "focus" in v) return { step: "internships" };
        return v;
      });
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

  // ── Wizard ───────────────────────────────────────────────────────────
  const personalDone = !!(
    state.registration.studentName &&
    state.registration.parentName &&
    state.registration.parentEmail &&
    state.registration.parentPhone
  );
  const internshipsDone =
    state.eligibleCompanies.length > 0 &&
    state.eligibleCompanies.every((c) => c.feedback);
  const opsDone = !!state.ops.updatedAt;

  return (
    <div className="space-y-5">
      <Stepper
        currentStep={view.step}
        onJump={(s) => setView({ step: s })}
        personalDone={personalDone}
        internshipsDone={internshipsDone}
        opsDone={opsDone}
      />

      {state.flash && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
          {state.flash}
        </p>
      )}

      {view.step === "personal" && (
        <PersonalForm
          state={state}
          formAction={formAction}
          pending={pending}
          error={state.error}
        />
      )}
      {view.step === "internships" && "focus" in view && (
        <CompanyForm
          sessionId={state.sessionId}
          registrationId={state.registration.id}
          company={state.eligibleCompanies.find((c) => c.sessionCompanyId === view.focus)!}
          formAction={formAction}
          pending={pending}
          onBack={() => setView({ step: "internships" })}
          error={state.error}
        />
      )}
      {view.step === "internships" && !("focus" in view) && (
        <InternshipBoard
          state={state}
          onPickCompany={(scId) => setView({ step: "internships", focus: scId })}
          onContinue={() => setView({ step: "ops" })}
        />
      )}
      {view.step === "ops" && (
        <OpsForm
          state={state}
          formAction={formAction}
          pending={pending}
          error={state.error}
          allDone={personalDone && internshipsDone && opsDone}
        />
      )}
    </div>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────

function Stepper({
  currentStep,
  onJump,
  personalDone,
  internshipsDone,
  opsDone,
}: {
  currentStep: Step;
  onJump: (s: Step) => void;
  personalDone: boolean;
  internshipsDone: boolean;
  opsDone: boolean;
}) {
  const steps: { id: Step; label: string; done: boolean }[] = [
    { id: "personal", label: "1. Personal details", done: personalDone },
    { id: "internships", label: "2. Internship feedback", done: internshipsDone },
    { id: "ops", label: "3. Program feedback", done: opsDone },
  ];
  return (
    <div className="bg-white border rounded-lg p-2 flex gap-1 text-xs overflow-x-auto">
      {steps.map((s) => {
        const active = s.id === currentStep;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onJump(s.id)}
            className={`flex-1 min-w-fit px-3 py-2 rounded-md font-medium transition whitespace-nowrap ${
              active
                ? "bg-primary text-white"
                : s.done
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {s.done && !active && "✓ "}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Section 1: Personal details ────────────────────────────────────────

function PersonalForm({
  state,
  formAction,
  pending,
  error,
}: {
  state: Extract<FeedbackPhase, { phase: "board" }>;
  formAction: (formData: FormData) => void;
  pending: boolean;
  error?: string;
}) {
  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-5">
      <input type="hidden" name="intent" value="submit_personal" />
      <input type="hidden" name="sessionId" value={state.sessionId} />
      <input type="hidden" name="registrationId" value={state.registration.id} />

      <div>
        <h2 className="text-lg font-bold mb-1">Personal details</h2>
        <p className="text-sm text-gray-600">
          Confirm and edit these as needed. <strong>The student name below is what
          will appear on the participation certificate</strong> — please make sure the
          spelling is exactly how you want it printed.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student Name <span className="text-red-500">*</span>
          </label>
          <input
            name="studentName"
            required
            defaultValue={state.registration.studentName}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">As it will appear on the certificate.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class / Section
          </label>
          <input
            value={state.registration.classSection}
            disabled
            className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Locked — contact school if incorrect.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Roll Number
          </label>
          <input
            value={state.registration.rollNumber}
            disabled
            className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Locked — contact school if incorrect.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent / Guardian Name <span className="text-red-500">*</span>
          </label>
          <input
            name="parentName"
            required
            defaultValue={state.registration.parentName}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Email <span className="text-red-500">*</span>
          </label>
          <input
            name="parentEmail"
            type="email"
            required
            defaultValue={state.registration.parentEmail}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Mobile <span className="text-red-500">*</span>
          </label>
          <input
            name="parentPhone"
            type="tel"
            required
            defaultValue={state.registration.parentPhone}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save and continue →"}
      </button>
    </form>
  );
}

// ─── Section 2: Internship board ────────────────────────────────────────

function InternshipBoard({
  state,
  onPickCompany,
  onContinue,
}: {
  state: Extract<FeedbackPhase, { phase: "board" }>;
  onPickCompany: (scId: string) => void;
  onContinue: () => void;
}) {
  const reviewed = state.eligibleCompanies.filter((c) => c.feedback).length;
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-base text-gray-900">Internship feedback</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Click &quot;Give feedback&quot; only for the internships your child actually
            attended.{" "}
            {state.eligibleCompanies.length === 0
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
                  onClick={() => onPickCompany(c.sessionCompanyId)}
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

      <button
        type="button"
        onClick={onContinue}
        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition"
      >
        Continue to program feedback →
      </button>
    </div>
  );
}

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

// ─── Section 3: Ops feedback ────────────────────────────────────────────

function OpsForm({
  state,
  formAction,
  pending,
  error,
  allDone,
}: {
  state: Extract<FeedbackPhase, { phase: "board" }>;
  formAction: (formData: FormData) => void;
  pending: boolean;
  error?: string;
  allDone: boolean;
}) {
  return (
    <>
      {allDone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center">
          <p className="text-emerald-800 font-bold text-lg mb-1">
            🎉 All feedback complete
          </p>
          <p className="text-emerald-700 text-sm">
            You&apos;re eligible for the participation certificate. You can still
            update any section if you&apos;d like.
          </p>
        </div>
      )}

      <form action={formAction} className="bg-white border rounded-lg p-6 space-y-5">
        <input type="hidden" name="intent" value="submit_ops" />
        <input type="hidden" name="sessionId" value={state.sessionId} />
        <input type="hidden" name="registrationId" value={state.registration.id} />

        <div>
          <h2 className="text-lg font-bold">Program / operations feedback</h2>
          <p className="text-sm text-gray-600 mt-1">
            How the Oyster program ran overall — communication, logistics, and your
            ideas for next time.
          </p>
        </div>

        <RadioGroup
          label="How satisfied are you with the overall organization (communication, logistics, guidance)?"
          name="organizationSatisfaction"
          options={ORG}
          defaultValue={state.ops.organizationSatisfaction ?? undefined}
        />
        <RadioGroup
          label="How likely are you to encourage your child to apply for more Oyster internships in the future?"
          name="encourageMore"
          options={ENCOURAGE}
          defaultValue={state.ops.encourageMore ?? undefined}
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
            defaultValue={state.ops.likedAndBetter ?? ""}
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
            defaultValue={state.ops.suggestions ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save program feedback"}
        </button>
      </form>
    </>
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
