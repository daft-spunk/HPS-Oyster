"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addSpeakerToSession } from "@/lib/actions/talks";
import { Field } from "@/components/admin/Field";

interface Speaker {
  id: string;
  name: string;
  defaultSlotLimit: number;
}

export function LinkSpeakerForm({
  sessionId,
  speakers,
}: {
  sessionId: string;
  speakers: Speaker[];
}) {
  const action = addSpeakerToSession.bind(null, sessionId);
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedId, setSelectedId] = useState("");
  const selected = speakers.find((s) => s.id === selectedId);

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
          Speaker <span className="text-red-500">*</span>
        </label>
        <select
          name="speakerId"
          required
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Pick a speaker from your library...</option>
          {speakers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <Field
        label="Topic / Subject of Talk"
        name="topic"
        required
        placeholder="e.g. AI & Career Planning"
        helpText="This is the topic for THIS session. The same speaker can give different topics in different sessions."
      />
      <Field
        label="About the Topic"
        name="topicDescription"
        textarea
        rows={3}
        helpText="Longer description shown on the public talks page"
      />

      <div className="grid grid-cols-3 gap-4">
        <Field label="Venue" name="venue" placeholder="Class 10A" />
        <Field
          label="Slot Limit"
          name="slotLimit"
          type="number"
          defaultValue={selected?.defaultSlotLimit || 30}
          required
        />
        <Field label="Display Order" name="displayOrder" type="number" defaultValue={0} />
      </div>

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
