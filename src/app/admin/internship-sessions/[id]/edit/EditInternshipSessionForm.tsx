"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateInternshipSession } from "@/lib/actions/internships";
import { Field } from "@/components/admin/Field";

interface Session {
  id: string;
  title: string;
  editionLabel: string;
  targetClass: "9" | "10";
  description: string | null;
  regDeadline: string | null;
}

export function EditInternshipSessionForm({ session }: { session: Session }) {
  const action = updateInternshipSession.bind(null, session.id);
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state) {
      router.push(`/admin/internship-sessions/${session.id}`);
    }
  }, [state, router, session.id]);

  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
      <Field label="Title" name="title" required defaultValue={session.title} />
      <Field
        label="Edition Label"
        name="editionLabel"
        required
        defaultValue={session.editionLabel}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Class <span className="text-red-500">*</span>
        </label>
        <select
          name="targetClass"
          required
          defaultValue={session.targetClass}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
        </select>
      </div>
      <Field
        label="Session Description"
        name="description"
        textarea
        rows={4}
        defaultValue={session.description}
        placeholder="A short paragraph introducing this round of internships."
        helpText="One paragraph shown at the top of the public page. Each company below has its own detailed sections."
      />
      <Field
        label="Registration Deadline"
        name="regDeadline"
        type="datetime-local"
        defaultValue={session.regDeadline}
        helpText="Registration auto-closes after this time"
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
