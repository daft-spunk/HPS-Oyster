"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSpeaker } from "@/lib/actions/library";
import { Field } from "@/components/admin/Field";

interface Speaker {
  id: string;
  name: string;
  house: string | null;
  bio: string;
  batchYear: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  defaultSlotLimit: number;
  notes: string | null;
}

export function EditSpeakerForm({ speaker }: { speaker: Speaker }) {
  const action = updateSpeaker.bind(null, speaker.id);
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state) router.push("/admin/library/speakers");
  }, [state, router]);

  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
      <Field label="Name" name="name" required defaultValue={speaker.name} />
      <Field
        label="Bio"
        name="bio"
        required
        textarea
        rows={4}
        defaultValue={speaker.bio}
        helpText="About the speaker — their background and experience"
      />
      <div className="grid grid-cols-3 gap-4">
        <Field label="House" name="house" defaultValue={speaker.house} />
        <Field label="Batch Year" name="batchYear" defaultValue={speaker.batchYear} />
        <Field
          label="Default Slot Limit"
          name="defaultSlotLimit"
          type="number"
          defaultValue={speaker.defaultSlotLimit}
        />
      </div>
      <div>
        {speaker.photoUrl && (
          <div className="flex items-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={speaker.photoUrl}
              alt={speaker.name}
              className="w-16 h-16 rounded-full object-cover border"
            />
            <span className="text-xs text-gray-500">Current photo</span>
          </div>
        )}
        <Field
          label="Photo URL"
          name="photoUrl"
          defaultValue={speaker.photoUrl}
          placeholder="https://..."
          helpText="A link to a square headshot works best — images get cropped to a circle."
        />
      </div>
      <Field label="LinkedIn URL" name="linkedinUrl" defaultValue={speaker.linkedinUrl} />
      <Field label="Internal Notes" name="notes" textarea rows={2} defaultValue={speaker.notes} />

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
