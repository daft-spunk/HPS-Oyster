"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateInternshipRegistration } from "@/lib/actions/internships";
import { Field } from "@/components/admin/Field";

interface Company {
  sessionCompanyId: string;
  name: string;
  sector: string;
}

interface Registration {
  studentName: string;
  classSection: string;
  rollNumber: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  interests: string | null;
  pref1SessionCompanyId: string;
  pref1Reason: string;
  pref2SessionCompanyId: string | null;
  pref2Reason: string | null;
  pref3SessionCompanyId: string | null;
  pref3Reason: string | null;
}

export function EditRegistrationForm({
  sessionId,
  registrationId,
  companies,
  maxPreferences,
  registration,
}: {
  sessionId: string;
  registrationId: string;
  companies: Company[];
  maxPreferences: number;
  registration: Registration;
}) {
  const action = updateInternshipRegistration.bind(null, registrationId, sessionId);
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push(`/admin/internship-sessions/${sessionId}/registrations`);
    }
  }, [state, router, sessionId]);

  const slots: Array<{ idx: 1 | 2 | 3; companyId: string | null; reason: string | null }> = [
    { idx: 1, companyId: registration.pref1SessionCompanyId, reason: registration.pref1Reason },
    { idx: 2, companyId: registration.pref2SessionCompanyId, reason: registration.pref2Reason },
    { idx: 3, companyId: registration.pref3SessionCompanyId, reason: registration.pref3Reason },
  ];

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Student Name" name="studentName" required defaultValue={registration.studentName} />
        <Field
          label="Class / Section"
          name="classSection"
          required
          defaultValue={registration.classSection}
        />
        <Field label="Roll Number" name="rollNumber" required defaultValue={registration.rollNumber} />
        <Field label="Parent Name" name="parentName" required defaultValue={registration.parentName} />
        <Field
          label="Parent Email"
          name="parentEmail"
          type="email"
          required
          defaultValue={registration.parentEmail}
        />
        <Field
          label="Parent Phone"
          name="parentPhone"
          required
          defaultValue={registration.parentPhone}
        />
      </div>
      <Field
        label="Interests"
        name="interests"
        textarea
        rows={2}
        defaultValue={registration.interests}
      />

      <hr />
      <p className="text-sm font-medium text-gray-700">
        Preferences (1 required, up to {maxPreferences})
      </p>

      {slots.slice(0, maxPreferences).map((slot) => (
        <div key={slot.idx} className="bg-gray-50 rounded-lg p-3 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Preference {slot.idx} {slot.idx === 1 && <span className="text-red-500">*</span>}
          </label>
          <select
            name={`pref${slot.idx}SessionCompanyId`}
            required={slot.idx === 1}
            defaultValue={slot.companyId ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">
              {slot.idx === 1 ? "Select company..." : "Optional — select company..."}
            </option>
            {companies.map((c) => (
              <option key={c.sessionCompanyId} value={c.sessionCompanyId}>
                {c.name} ({c.sector})
              </option>
            ))}
          </select>
          <textarea
            name={`pref${slot.idx}Reason`}
            rows={2}
            defaultValue={slot.reason ?? ""}
            placeholder="Reason / why interested"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      ))}

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/internship-sessions/${sessionId}/registrations`)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
