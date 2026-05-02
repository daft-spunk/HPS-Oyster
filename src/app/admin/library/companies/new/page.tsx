"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "@/lib/actions/library";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field } from "@/components/admin/Field";

export default function NewCompanyPage() {
  const [state, formAction, pending] = useActionState(createCompany, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state) router.push("/admin/library/companies");
  }, [state, router]);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Add Company"
        subtitle="This company will be added to your library and can host internships in any future session."
        backHref="/admin/library/companies"
        backLabel="Back to Companies"
      />
      <form action={formAction} className="bg-white border rounded-lg p-6 space-y-4">
        <Field label="Company Name" name="name" required />
        <Field label="Sector" name="sector" required placeholder="Healthcare, Food, Law, etc." />
        <Field
          label="Description"
          name="description"
          required
          textarea
          rows={4}
          helpText="What the company does — visible to students"
        />
        <Field label="Website URL" name="websiteUrl" placeholder="https://example.com" helpText="Link shown on the public internships page" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact Person" name="contactName" />
          <Field label="Contact Email" name="contactEmail" type="email" />
        </div>
        <Field
          label="Default Slots per Session"
          name="defaultSlotLimit"
          type="number"
          defaultValue={2}
          helpText="How many students this company typically hosts. Override per session."
        />
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
