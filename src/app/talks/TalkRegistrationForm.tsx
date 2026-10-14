"use client";

import { useActionState } from "react";
import { registerForTalk } from "@/lib/actions/talks";
import { ValidatedField, ValidatedTextarea } from "@/components/ValidatedInput";
import { HoneypotFields } from "@/components/HoneypotFields";

interface Speaker {
  sessionSpeakerId: string;
  name: string;
  topic: string;
  slotsLeft: number;
  venue: string | null;
}

export function TalkRegistrationForm({
  sessionId,
  speakers,
  sessionDate,
}: {
  sessionId: string;
  speakers: Speaker[];
  sessionDate?: string | null;
}) {
  const [state, formAction, pending] = useActionState(registerForTalk, null);

  if (state?.success) {
    const formattedDate = sessionDate
      ? new Date(sessionDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        })
      : null;
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <p className="text-green-700 font-bold text-lg mb-3">
          Your session choice has been successfully recorded.
        </p>
        <p className="text-green-700 text-sm mb-3">
          You&apos;re now one step closer to exploring a new field, discovering your strengths, and gaining clarity about your future academic stream.
        </p>
        <p className="text-green-700 text-sm mb-2">
          To make the most of your Role Model Talk, we encourage you to do a little research on the topic and domain you selected. Understanding the basics beforehand will help you:
        </p>
        <ul className="list-disc list-inside text-green-700 text-sm mb-3 space-y-1">
          <li>Follow the session more easily</li>
          <li>Ask thoughtful questions</li>
          <li>Get clearer, more relevant answers</li>
          <li>Gain deeper insight into whether this stream fits your interests</li>
        </ul>
        {formattedDate && (
          <p className="text-green-700 text-sm mb-3">
            We look forward to seeing you on <strong>{formattedDate}</strong> for an inspiring and meaningful session!
          </p>
        )}
        <p className="text-green-700 text-sm">
          For live updates &amp; notifications, join our WhatsApp announcement community:{" "}
          <a
            href="https://chat.whatsapp.com/FX98sOoqJrDGtCZ6YACZyi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-800 font-semibold underline"
          >
            Click here
          </a>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="sessionId" value={sessionId} />
      <HoneypotFields />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedField label="Student Name" name="studentName" required minLength={2} />
        <ValidatedField
          label="Class / Section"
          name="classSection"
          required
          placeholder="e.g. 9-A"
          pattern="^(9|10)[\s-]?[A-Za-z]?$"
          errorMessage="Use format like 9-A or 10-B"
        />
        <ValidatedField label="Roll Number" name="rollNumber" required minLength={1} />
        <ValidatedField label="Parent Name" name="parentName" required minLength={2} />
        <ValidatedField
          label="Parent Email"
          name="parentEmail"
          type="email"
          required
          errorMessage="Please enter a valid email address"
        />
        <ValidatedField
          label="Parent Phone"
          name="parentPhone"
          type="tel"
          required
          pattern="[0-9+\-\s]{10,15}"
          errorMessage="Phone must be 10–15 digits"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Choose a Speaker *
        </label>
        <select
          name="sessionSpeakerId"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        >
          <option value="">Select a speaker...</option>
          {speakers.map((s) => (
            <option key={s.sessionSpeakerId} value={s.sessionSpeakerId}>
              {s.name} — {s.topic} ({s.slotsLeft} slots{s.venue ? ` · ${s.venue}` : ""})
            </option>
          ))}
        </select>
      </div>

      <ValidatedTextarea
        label="Why would you like to attend this session?"
        name="whyAttend"
        required
        rows={3}
        minLength={10}
        placeholder="Tell us about your interests and what you hope to learn..."
        errorMessage="Please write at least 10 characters"
      />

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
