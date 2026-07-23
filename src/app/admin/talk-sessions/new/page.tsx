"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTalkSession } from "@/lib/actions/talks";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field } from "@/components/admin/Field";

export default function NewTalkSessionPage() {
  const [state, formAction, pending] = useActionState(createTalkSession, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && "id" in state) {
      router.push(`/admin/talk-sessions/${state.id}`);
    }
  }, [state, router]);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Create Talk Session"
        subtitle="Step 1 of 2: Set up the session. Next, you'll link speakers from your Library."
        backHref="/admin/talk-sessions"
        backLabel="Back to Talk Sessions"
      />
      <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
        <Field label="Title" name="title" required placeholder="Role Model Talks – January 2026" />
        <Field label="Edition Label" name="editionLabel" required placeholder="Edition 6" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Class <span className="text-red-500">*</span>
          </label>
          <select
            name="targetClass"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="9_10">Class 9 &amp; 10</option>
            <option value="11_12">Class 11 &amp; 12</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Class 9 and Class 10 sessions can be active independently.
          </p>
        </div>
        <Field
          label="About this Session"
          name="description"
          textarea
          rows={5}
          placeholder="What is this session about? What can students expect? What should they bring? Who should attend?"
          helpText="Shown in a popup on the public page. Add as much detail as you like."
        />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Session Date" name="sessionDate" type="date" />
          <Field label="Time Slot" name="timeSlot" placeholder="2:00 PM – 3:00 PM" />
        </div>
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
          {pending ? "Creating..." : "Create & Continue → Add Speakers"}
        </button>
      </form>
    </div>
  );
}
