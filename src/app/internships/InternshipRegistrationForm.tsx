"use client";

import { useActionState, useState } from "react";
import { registerForInternship } from "@/lib/actions/internships";
import { ValidatedField, ValidatedTextarea } from "@/components/ValidatedInput";
import { HoneypotFields } from "@/components/HoneypotFields";

interface Company {
  sessionCompanyId: string;
  name: string;
  sector: string;
}

export function InternshipRegistrationForm({
  sessionId,
  companies,
  maxPreferences = 3,
}: {
  sessionId: string;
  companies: Company[];
  maxPreferences?: number;
}) {
  const [state, formAction, pending] = useActionState(registerForInternship, null);
  const [pref1, setPref1] = useState("");
  const [pref2, setPref2] = useState("");
  const [pref3, setPref3] = useState("");

  if (state?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <p className="text-green-700 font-bold text-lg mb-3">
          Thank you for registering—your preferences are saved!
        </p>
        <p className="text-green-700 text-sm mb-3">
          You can register again to change your preferences anytime before the registration deadline using the same school roll number.
        </p>
        <p className="text-green-700 text-sm mb-3">
          Only your latest submission will be considered for allocation.
        </p>
        <p className="text-green-700 text-sm mb-3">
          <strong>Please note:</strong> submissions are expressions of interest; final placements depend on fit and availability.
        </p>
        <p className="text-green-700 text-sm">
          For live updates on new companies, reminders, and timelines, join our WhatsApp announcement community:{" "}
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

  const getAvailableCompanies = (exclude: string[]) =>
    companies.filter((c) => !exclude.includes(c.sessionCompanyId));

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

      <ValidatedField
        label="Your Interests / Preferred Subjects"
        name="interests"
        placeholder="e.g. Science, Arts, Commerce, Technology..."
      />

      <hr className="my-6" />
      <h4 className="font-bold text-gray-800">
        {maxPreferences === 1
          ? "Select Your Preferred Company"
          : `Select Your Top ${maxPreferences} Preferences`}
      </h4>
      <p className="text-xs text-gray-500 mb-4">
        {maxPreferences === 1
          ? "Tell us why you're interested. At least 10 characters."
          : "Your first preference is required. Add more if you'd like — each reason must be at least 10 characters."}
      </p>

      {/* Preference 1 (always required) */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {maxPreferences === 1 ? "Company *" : "Preference 1 *"}
        </label>
        <select
          name="pref1SessionCompanyId"
          required
          value={pref1}
          onChange={(e) => setPref1(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
        >
          <option value="">Select company...</option>
          {getAvailableCompanies([pref2, pref3]).map((c) => (
            <option key={c.sessionCompanyId} value={c.sessionCompanyId}>
              {c.name} ({c.sector})
            </option>
          ))}
        </select>
        <ValidatedTextarea
          name="pref1Reason"
          required
          rows={2}
          minLength={10}
          placeholder="Why are you interested in this company?"
          errorMessage="Please write at least 10 characters"
        />
      </div>

      {/* Preference 2 (optional, only if maxPreferences >= 2) */}
      {maxPreferences >= 2 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Preference 2 <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            name="pref2SessionCompanyId"
            value={pref2}
            onChange={(e) => setPref2(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
          >
            <option value="">Select company (optional)...</option>
            {getAvailableCompanies([pref1, pref3]).map((c) => (
              <option key={c.sessionCompanyId} value={c.sessionCompanyId}>
                {c.name} ({c.sector})
              </option>
            ))}
          </select>
          {pref2 && (
            <ValidatedTextarea
              name="pref2Reason"
              required
              rows={2}
              minLength={10}
              placeholder="Why are you interested in this company?"
              errorMessage="Please write at least 10 characters"
            />
          )}
        </div>
      )}

      {/* Preference 3 (optional, only if maxPreferences >= 3) */}
      {maxPreferences >= 3 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Preference 3 <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            name="pref3SessionCompanyId"
            value={pref3}
            onChange={(e) => setPref3(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
          >
            <option value="">Select company (optional)...</option>
            {getAvailableCompanies([pref1, pref2]).map((c) => (
              <option key={c.sessionCompanyId} value={c.sessionCompanyId}>
                {c.name} ({c.sector})
              </option>
            ))}
          </select>
          {pref3 && (
            <ValidatedTextarea
              name="pref3Reason"
              required
              rows={2}
              minLength={10}
              placeholder="Why are you interested in this company?"
              errorMessage="Please write at least 10 characters"
            />
          )}
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit Registration"}
      </button>
    </form>
  );
}
