"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addCompanyToSession } from "@/lib/actions/internships";
import { Field } from "@/components/admin/Field";

interface Company {
  id: string;
  name: string;
  sector: string;
  defaultSlotLimit: number;
  timesUsed: number;
  lastUsedTitle: string | null;
}

export function LinkCompanyForm({
  sessionId,
  companies,
}: {
  sessionId: string;
  companies: Company[];
}) {
  const action = addCompanyToSession.bind(null, sessionId);
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedId, setSelectedId] = useState("");
  const selected = companies.find((c) => c.id === selectedId);

  useEffect(() => {
    if (state && "success" in state && formRef.current) {
      formRef.current.reset();
      setSelectedId("");
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company <span className="text-red-500">*</span>
        </label>
        <select
          name="companyId"
          required
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Pick a company from your library...</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.sector})
              {Number(c.timesUsed) > 0
                ? ` — last hosted ${c.lastUsedTitle}`
                : " — never hosted"}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Internship Date" name="internshipDate" type="date" />
        <Field
          label="Slots Available"
          name="slotsAvailable"
          type="number"
          defaultValue={selected?.defaultSlotLimit || 2}
          required
        />
        <Field label="Display Order" name="displayOrder" type="number" defaultValue={0} />
      </div>

      <Field
        label="About this Internship"
        name="aboutInternship"
        textarea
        rows={4}
        placeholder="Detailed paragraph(s) about what this specific company offers in this session."
        helpText="Shown on the public page so students can decide which internship suits them."
      />
      <Field
        label="Who is it for?"
        name="whoFor"
        textarea
        rows={3}
        placeholder="e.g. Students interested in healthcare research and lab work."
      />
      <Field
        label="What to expect"
        name="whatToExpect"
        textarea
        rows={4}
        placeholder="e.g. Tour of the lab, observe a typical research session, talk with the team about projects."
      />
      <Field
        label="What to bring"
        name="whatToBring"
        textarea
        rows={3}
        placeholder="e.g. Closed-toe shoes, lab coat (provided), notebook and pen, school ID."
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Linking..." : "Link to Session"}
      </button>
    </form>
  );
}
