"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSessionCompany } from "@/lib/actions/internships";
import { Field } from "@/components/admin/Field";

interface SessionCompany {
  id: string;
  internshipDates: string[] | null;
  slotsAvailable: number;
  displayOrder: number;
  aboutInternship: string | null;
  whoFor: string | null;
  whatToExpect: string | null;
  whatToBring: string | null;
}

export function EditSessionCompanyForm({
  sessionId,
  sessionCompany,
}: {
  sessionId: string;
  sessionCompany: SessionCompany;
}) {
  const action = updateSessionCompany.bind(null, sessionCompany.id, sessionId);
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state) {
      router.push(`/admin/internship-sessions/${sessionId}`);
    }
  }, [state, router, sessionId]);

  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
      <Field
        label="Internship Date(s)"
        name="internshipDates"
        defaultValue={sessionCompany.internshipDates?.join(", ") ?? ""}
        placeholder="2026-05-14, 2026-05-22, 2026-05-28"
        helpText="One or more dates in YYYY-MM-DD format. Comma-separate multiple dates."
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Slots Available"
          name="slotsAvailable"
          type="number"
          defaultValue={sessionCompany.slotsAvailable}
          required
        />
        <Field
          label="Display Order"
          name="displayOrder"
          type="number"
          defaultValue={sessionCompany.displayOrder}
        />
      </div>

      <Field
        label="About this Internship"
        name="aboutInternship"
        textarea
        rows={4}
        defaultValue={sessionCompany.aboutInternship}
        helpText="Detailed paragraph(s) about what this specific company offers."
      />
      <Field
        label="Who is it for?"
        name="whoFor"
        textarea
        rows={3}
        defaultValue={sessionCompany.whoFor}
      />
      <Field
        label="What to expect"
        name="whatToExpect"
        textarea
        rows={4}
        defaultValue={sessionCompany.whatToExpect}
      />
      <Field
        label="What to bring"
        name="whatToBring"
        textarea
        rows={3}
        defaultValue={sessionCompany.whatToBring}
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
