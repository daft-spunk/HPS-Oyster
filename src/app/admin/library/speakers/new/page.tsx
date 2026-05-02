"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSpeaker } from "@/lib/actions/library";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field } from "@/components/admin/Field";

export default function NewSpeakerPage() {
  const [state, formAction, pending] = useActionState(createSpeaker, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state) router.push("/admin/library/speakers");
  }, [state, router]);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Add Speaker"
        subtitle="This speaker will be added to your library and can be used in any future talk session."
        backHref="/admin/library/speakers"
        backLabel="Back to Speakers"
      />
      <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
        <Field label="Name" name="name" required />
        <Field label="Bio" name="bio" required textarea rows={4} helpText="About the speaker — their background and experience" />
        <div className="grid grid-cols-3 gap-4">
          <Field label="House" name="house" placeholder="e.g. Anwar" />
          <Field label="Batch Year" name="batchYear" placeholder="2007" />
          <Field
            label="Default Slot Limit"
            name="defaultSlotLimit"
            type="number"
            defaultValue={30}
            helpText="Override per session"
          />
        </div>
        <Field
          label="Photo URL"
          name="photoUrl"
          placeholder="https://..."
          helpText="A link to a square headshot works best — images get cropped to a circle."
        />
        <Field label="LinkedIn URL" name="linkedinUrl" placeholder="https://linkedin.com/in/..." />
        <Field label="Internal Notes" name="notes" textarea rows={2} helpText="Only visible to admins" />

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add to Library"}
        </button>
      </form>
    </div>
  );
}
