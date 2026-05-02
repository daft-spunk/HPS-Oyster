"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSessionSpeaker } from "@/lib/actions/talks";
import { Field } from "@/components/admin/Field";

interface SessionSpeaker {
  id: string;
  topic: string;
  topicDescription: string | null;
  venue: string | null;
  slotLimit: number;
  displayOrder: number;
}

export function EditSessionSpeakerForm({
  sessionId,
  sessionSpeaker,
}: {
  sessionId: string;
  sessionSpeaker: SessionSpeaker;
}) {
  const action = updateSessionSpeaker.bind(null, sessionSpeaker.id, sessionId);
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state) {
      router.push(`/admin/talk-sessions/${sessionId}`);
    }
  }, [state, router, sessionId]);

  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
      <Field
        label="Topic / Subject of Talk"
        name="topic"
        required
        defaultValue={sessionSpeaker.topic}
        helpText="Topic for THIS session. Same speaker can give different topics in different sessions."
      />
      <Field
        label="About the Topic"
        name="topicDescription"
        textarea
        rows={3}
        defaultValue={sessionSpeaker.topicDescription}
        helpText="Longer description shown on the public talks page"
      />
      <div className="grid grid-cols-3 gap-4">
        <Field
          label="Venue"
          name="venue"
          placeholder="Class 10A"
          defaultValue={sessionSpeaker.venue}
        />
        <Field
          label="Slot Limit"
          name="slotLimit"
          type="number"
          required
          defaultValue={sessionSpeaker.slotLimit}
        />
        <Field
          label="Display Order"
          name="displayOrder"
          type="number"
          defaultValue={sessionSpeaker.displayOrder}
        />
      </div>

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
