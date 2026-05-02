"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCompany } from "@/lib/actions/library";
import { Field } from "@/components/admin/Field";

interface Company {
  id: string;
  name: string;
  sector: string;
  description: string;
  websiteUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  defaultSlotLimit: number;
  notes: string | null;
}

export function EditCompanyForm({ company }: { company: Company }) {
  const action = updateCompany.bind(null, company.id);
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state) router.push("/admin/library/companies");
  }, [state, router]);

  return (
    <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
      <Field label="Company Name" name="name" required defaultValue={company.name} />
      <Field label="Sector" name="sector" required defaultValue={company.sector} />
      <Field
        label="Description"
        name="description"
        required
        textarea
        rows={4}
        defaultValue={company.description}
      />
      <Field label="Website URL" name="websiteUrl" defaultValue={company.websiteUrl} placeholder="https://example.com" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Contact Person" name="contactName" defaultValue={company.contactName} />
        <Field label="Contact Email" name="contactEmail" type="email" defaultValue={company.contactEmail} />
      </div>
      <Field
        label="Default Slots per Session"
        name="defaultSlotLimit"
        type="number"
        defaultValue={company.defaultSlotLimit}
      />
      <Field label="Internal Notes" name="notes" textarea rows={2} defaultValue={company.notes} />

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
