"use client";

import { useActionState, useEffect, useRef } from "react";
import { manuallyAddInternshipRegistration } from "@/lib/actions/internships";
import { Field } from "@/components/admin/Field";

interface Company {
  sessionCompanyId: string;
  name: string;
  sector: string;
}

export function ManualEntryForm({
  sessionId,
  companies,
  maxPreferences,
}: {
  sessionId: string;
  companies: Company[];
  maxPreferences: number;
}) {
  const action = manuallyAddInternshipRegistration.bind(null, sessionId);
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "success" in state && state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Student Name" name="studentName" required />
        <Field label="Class / Section" name="classSection" required placeholder="e.g. 9-A" />
        <Field label="Roll Number" name="rollNumber" required />
        <Field label="Parent Name" name="parentName" required />
        <Field label="Parent Email" name="parentEmail" type="email" required />
        <Field label="Parent Phone" name="parentPhone" required />
      </div>
      <Field label="Interests" name="interests" />
      <Field
        label="Registered At (optional)"
        name="registeredAt"
        type="datetime-local"
        helpText="Leave blank to use the current time"
      />

      <hr />
      <p className="text-sm font-medium text-gray-700">
        Preferences (1 required, up to {maxPreferences})
      </p>

      {Array.from({ length: maxPreferences }).map((_, i) => {
        const idx = i + 1;
        return (
          <div key={idx} className="bg-gray-50 rounded-lg p-3 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Preference {idx} {idx === 1 && <span className="text-red-500">*</span>}
            </label>
            <select
              name={`pref${idx}SessionCompanyId`}
              required={idx === 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">{idx === 1 ? "Select company..." : "Optional — select company..."}</option>
              {companies.map((c) => (
                <option key={c.sessionCompanyId} value={c.sessionCompanyId}>
                  {c.name} ({c.sector})
                </option>
              ))}
            </select>
            <textarea
              name={`pref${idx}Reason`}
              rows={2}
              placeholder="Reason / why interested"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        );
      })}

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{state.error}</p>
      )}
      {state && "success" in state && state.success && (
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          Registration added.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add Registration"}
      </button>
    </form>
  );
}
