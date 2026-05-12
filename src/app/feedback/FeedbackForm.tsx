"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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

type SubStep = "personal" | "section2" | "section3";
type View = { kind: "board" } | { kind: "wizard"; scId: string; subStep: SubStep };

function isCompanyComplete(c: BoardCompany): boolean {
  return !!(
    c.feedback &&
    c.feedback.organizationSatisfaction &&
    c.feedback.encourageMore &&
    c.feedback.likedAndBetter
  );
}

function defaultSubStep(c: BoardCompany | undefined, hasStudent: boolean): SubStep {
  if (!c) return "personal";
  // No personal info yet → personal step
  if (!hasStudent) return "personal";
  // Row exists but section 2 not filled → section 2
  if (!c.feedback) return "section2";
  if (c.feedback.interactivityRating === null) return "section2";
  if (!c.feedback.organizationSatisfaction) return "section3";
  // All done — show personal so they can edit if needed
  return "personal";
}

export function FeedbackForm({
  sessionId,
  initialBoard,
}: {
  sessionId: string;
  initialBoard: FeedbackPhase;
}) {
  const [state, formAction, pending] = useActionState<FeedbackPhase, FormData>(
    feedbackEntry,
    initialBoard
  );
  const [view, setView] = useState<View>({ kind: "board" });

  const lastConsumedRef = useRef<{ scId?: string; step?: string } | null>(null);
  useEffect(() => {
    if (state.error || !state.lastSubmittedScId || !state.lastSubmittedStep) return;
    if (view.kind !== "wizard") return;
    if (state.lastSubmittedScId !== view.scId) return;
    const sig = { scId: state.lastSubmittedScId, step: state.lastSubmittedStep };
    if (
      lastConsumedRef.current?.scId === sig.scId &&
      lastConsumedRef.current?.step === sig.step
    )
      return;
    lastConsumedRef.current = sig;
    if (state.lastSubmittedStep === "personal") {
      setView({ kind: "wizard", scId: view.scId, subStep: "section2" });
    } else if (state.lastSubmittedStep === "section2") {
      setView({ kind: "wizard", scId: view.scId, subStep: "section3" });
    } else if (state.lastSubmittedStep === "section3") {
      setView({ kind: "board" });
    }
  }, [state, view]);

  // ── Per-internship wizard ───────────────────────────────────────────
  if (view.kind === "wizard") {
    const company = state.eligibleCompanies.find((c) => c.sessionCompanyId === view.scId);
    if (!company) {
      setView({ kind: "board" });
      return null;
    }
    return (
      <div className="space-y-4">
        {state.flash && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
            {state.flash}
          </p>
        )}
        <WizardHeader
          company={company}
          subStep={view.subStep}
          onJump={(s) => setView({ kind: "wizard", scId: view.scId, subStep: s })}
          onBackToBoard={() => setView({ kind: "board" })}
        />
        {view.subStep === "personal" && (
          <PersonalForm
            state={state}
            scId={view.scId}
            formAction={formAction}
            pending={pending}
            error={state.error}
          />
        )}
        {view.subStep === "section2" && (
          <Section2Form
            state={state}
            company={company}
            formAction={formAction}
            pending={pending}
            error={state.error}
          />
        )}
        {view.subStep === "section3" && (
          <Section3Form
            state={state}
            company={company}
            formAction={formAction}
            pending={pending}
            error={state.error}
          />
        )}
      </div>
    );
  }

  // ── Board view ───────────────────────────────────────────────────────
  const completed = state.eligibleCompanies.filter(isCompanyComplete).length;
  const allDone =
    state.eligibleCompanies.length > 0 && completed === state.eligibleCompanies.length;

  return (
    <div className="space-y-5">
      {state.currentStudent && (
        <div className="bg-white border rounded-lg p-5">
          <p className="text-sm text-gray-500">Hi,</p>
          <h2 className="text-xl font-bold">{state.currentStudent.studentName}</h2>
          <p className="text-xs text-gray-500 mt-1">
            {state.currentStudent.classSection} · Roll {state.currentStudent.rollNumber}
          </p>
        </div>
      )}

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
            You&apos;re eligible for the participation certificate.
          </p>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-sm text-gray-700">Pick an internship</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Click &quot;Give feedback&quot; on the internships your child actually
            attended.{" "}
            {state.eligibleCompanies.length === 0
              ? "None of the internships in this session have happened yet."
              : state.currentStudent
              ? `${completed} of ${state.eligibleCompanies.length} complete.`
              : `${state.eligibleCompanies.length} internship${
                  state.eligibleCompanies.length === 1 ? "" : "s"
                } available.`}
          </p>
        </div>
        {state.eligibleCompanies.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500 italic text-center">
            Once any internship date passes, it&apos;ll show up here.
          </p>
        ) : (
          <ul className="divide-y">
            {state.eligibleCompanies.map((c) => {
              const complete = isCompanyComplete(c);
              const inProgress = !!c.feedback && !complete;
              const startStep = defaultSubStep(c, !!state.currentStudent);
              return (
                <li key={c.sessionCompanyId} className="px-5 py-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.sector}</p>
                    {complete ? (
                      <p className="text-xs text-emerald-700 mt-1">
                        ✓ Submitted{" "}
                        {c.feedback!.updatedAt &&
                          new Date(c.feedback!.updatedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            timeZone: "Asia/Kolkata",
                          })}
                      </p>
                    ) : inProgress ? (
                      <p className="text-xs text-amber-700 mt-1">⌛ In progress</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">⌛ Not started</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setView({
                        kind: "wizard",
                        scId: c.sessionCompanyId,
                        subStep: startStep,
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      complete
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-primary text-white hover:bg-primary-light"
                    }`}
                  >
                    {complete ? "Edit" : inProgress ? "Continue" : "Give feedback"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Wizard header ──────────────────────────────────────────────────────

function WizardHeader({
  company,
  subStep,
  onJump,
  onBackToBoard,
}: {
  company: BoardCompany;
  subStep: SubStep;
  onJump: (s: SubStep) => void;
  onBackToBoard: () => void;
}) {
  const steps: { id: SubStep; label: string }[] = [
    { id: "personal", label: "1. Personal" },
    { id: "section2", label: "2. Internship feedback" },
    { id: "section3", label: "3. Program feedback" },
  ];
  return (
    <div>
      <button
        type="button"
        onClick={onBackToBoard}
        className="text-sm text-gray-500 hover:text-gray-700 mb-2"
      >
        ← Back to all internships
      </button>
      <div className="bg-white border rounded-lg p-4 mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Internship</p>
        <h2 className="text-lg font-bold">{company.name}</h2>
        <p className="text-xs text-gray-500">{company.sector}</p>
      </div>
      <div className="bg-white border rounded-lg p-2 flex gap-1 text-xs overflow-x-auto">
        {steps.map((s) => {
          const active = s.id === subStep;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onJump(s.id)}
              className={`flex-1 min-w-fit px-3 py-2 rounded-md font-medium transition whitespace-nowrap ${
                active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Hidden student fields (carried in every step's submit) ──────────────

function HiddenStudent({ state }: { state: FeedbackPhase }) {
  const s = state.currentStudent;
  if (!s) return null;
  return (
    <>
      <input type="hidden" name="studentName" value={s.studentName} />
      <input type="hidden" name="classSection" value={s.classSection} />
      <input type="hidden" name="rollNumber" value={s.rollNumber} />
      <input type="hidden" name="parentName" value={s.parentName} />
      <input type="hidden" name="parentEmail" value={s.parentEmail} />
      <input type="hidden" name="parentPhone" value={s.parentPhone} />
    </>
  );
}

// ─── Sub-step 1: Personal ───────────────────────────────────────────────

function PersonalForm({
  state,
  scId,
  formAction,
  pending,
  error,
}: {
  state: FeedbackPhase;
  scId: string;
  formAction: (formData: FormData) => void;
  pending: boolean;
  error?: string;
}) {
  const s = state.currentStudent;
  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-5">
      <input type="hidden" name="intent" value="submit_personal" />
      <input type="hidden" name="sessionId" value={state.sessionId} />
      <input type="hidden" name="sessionCompanyId" value={scId} />

      <div>
        <h2 className="text-base font-bold mb-1">Personal details</h2>
        <p className="text-sm text-gray-600">
          <strong>The student name below is what will appear on the participation
          certificate</strong> — please make sure the spelling is exactly how you want
          it printed.
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
            defaultValue={s?.studentName ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">As it will appear on the certificate.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class / Section <span className="text-red-500">*</span>
          </label>
          <input
            name="classSection"
            required
            defaultValue={s?.classSection ?? ""}
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
            defaultValue={s?.rollNumber ?? ""}
            placeholder="e.g. 22"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent / Guardian Name <span className="text-red-500">*</span>
          </label>
          <input
            name="parentName"
            required
            defaultValue={s?.parentName ?? ""}
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
            defaultValue={s?.parentEmail ?? ""}
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
            defaultValue={s?.parentPhone ?? ""}
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

// ─── Sub-step 2: Internship feedback ─────────────────────────────────────

function Section2Form({
  state,
  company,
  formAction,
  pending,
  error,
}: {
  state: FeedbackPhase;
  company: BoardCompany;
  formAction: (formData: FormData) => void;
  pending: boolean;
  error?: string;
}) {
  const pre = company.feedback;
  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-5">
      <input type="hidden" name="intent" value="submit_section_2" />
      <input type="hidden" name="sessionId" value={state.sessionId} />
      <input type="hidden" name="sessionCompanyId" value={company.sessionCompanyId} />
      <HiddenStudent state={state} />

      <h2 className="text-base font-bold">Internship feedback</h2>

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
        defaultValue={pre?.interactivityRating ?? undefined}
      />
      <RatingScale
        label="How would you rate the coaches/speakers?"
        name="speakerRating"
        leftLabel="Poor"
        rightLabel="Excellent"
        defaultValue={pre?.speakerRating ?? undefined}
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
        defaultValue={pre?.viewChangeLevel ?? undefined}
      />
      <RadioGroup
        label="How valuable was this internship for your child&apos;s overall learning?"
        name="learningValue"
        options={LEARNING}
        defaultValue={pre?.learningValue ?? undefined}
      />
      <RadioGroup
        label="Did this internship help your child get more clarity on what subjects to choose after 10th grade?"
        name="subjectClarity"
        options={CLARITY}
        defaultValue={pre?.subjectClarity ?? undefined}
      />

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

// ─── Sub-step 3: Program / ops feedback ──────────────────────────────────

function Section3Form({
  state,
  company,
  formAction,
  pending,
  error,
}: {
  state: FeedbackPhase;
  company: BoardCompany;
  formAction: (formData: FormData) => void;
  pending: boolean;
  error?: string;
}) {
  const pre = company.feedback;
  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-5">
      <input type="hidden" name="intent" value="submit_section_3" />
      <input type="hidden" name="sessionId" value={state.sessionId} />
      <input type="hidden" name="sessionCompanyId" value={company.sessionCompanyId} />
      <HiddenStudent state={state} />

      <div>
        <h2 className="text-base font-bold">Program / operations feedback</h2>
        <p className="text-sm text-gray-600 mt-1">
          How the Oyster program ran overall — communication, logistics, and your ideas
          for next time.
        </p>
      </div>

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

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition disabled:opacity-50"
      >
        {pending ? "Saving..." : "Finish this internship"}
      </button>
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
