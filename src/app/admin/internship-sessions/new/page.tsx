"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInternshipSession } from "@/lib/actions/internships";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field } from "@/components/admin/Field";

export default function NewInternshipSessionPage() {
  const [state, formAction, pending] = useActionState(createInternshipSession, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && "id" in state) {
      router.push(`/admin/internship-sessions/${state.id}`);
    }
  }, [state, router]);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Create Internship Session"
        subtitle="Step 1 of 2: Set up the session. Next, you'll link companies from your Library."
        backHref="/admin/internship-sessions"
        backLabel="Back to Internship Sessions"
      />
      <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
        <Field label="Title" name="title" required placeholder="Summer 2026 Internships" />
        <Field label="Edition Label" name="editionLabel" required placeholder="Edition 3" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Class <span className="text-red-500">*</span>
          </label>
          <select
            name="targetClass"
            required
            defaultValue="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="9_10">Class 9 &amp; 10</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Preferences
          </label>
          <select
            name="maxPreferences"
            defaultValue="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="1">1 — Pick one company</option>
            <option value="2">Up to 2 preferences</option>
            <option value="3">Up to 3 preferences</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            How many preferences a student can pick. The first is required; extras are optional.
          </p>
        </div>
        <Field
          label="Registration cutoff (days before internship)"
          name="registrationCutoffDays"
          type="number"
          defaultValue={2}
          helpText="Students cannot register for an internship within this many days of its date. Default: 2 days."
        />
        <Field
          label="Session Description"
          name="description"
          textarea
          rows={4}
          placeholder="A short paragraph introducing this round of internships."
          helpText="One paragraph shown at the top of the public page. Each company below has its own detailed sections."
        />
        <Field
          label="Registration Deadline"
          name="regDeadline"
          type="datetime-local"
          helpText="Registration auto-closes after this time"
        />

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create & Continue → Add Companies"}
        </button>
      </form>
    </div>
  );
}
