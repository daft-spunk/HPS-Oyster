"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateTalkSession } from "@/lib/actions/talks";
import { Field } from "@/components/admin/Field";

interface Session {
  id: string;
  title: string;
  editionLabel: string;
  targetClass: "9" | "10" | "9_10" | "11_12";
  description: string | null;
  sessionDate: string | null;
  timeSlot: string | null;
  regDeadline: string | null;
}

export function EditTalkSessionForm({ session }: { session: Session }) {
  const action = updateTalkSession.bind(null, session.id);
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state) {
      router.push(`/admin/talk-sessions/${session.id}`);
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
          <option value="9_10">Class 9 &amp; 10</option>
          <option value="11_12">Class 11 &amp; 12</option>
        </select>
      </div>
      <Field
        label="About this Session"
        name="description"
        textarea
        rows={5}
        defaultValue={session.description ?? ""}
        helpText="Shown in a popup on the public page. Add as much detail as you like."
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Session Date"
          name="sessionDate"
          type="date"
          defaultValue={session.sessionDate ?? ""}
        />
        <Field
          label="Time Slot"
          name="timeSlot"
          placeholder="2:00 PM – 3:00 PM"
          defaultValue={session.timeSlot ?? ""}
        />
      </div>
      <Field
        label="Registration Deadline"
        name="regDeadline"
        type="datetime-local"
        defaultValue={session.regDeadline ?? ""}
        helpText="Registration auto-closes after this time"
      />

      {state && "error" in state && state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
