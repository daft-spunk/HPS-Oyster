"use client";

import { useActionState } from "react";
import { bulkUploadInternshipRegistrations } from "@/lib/actions/internships";

export function CsvUploadForm({ sessionId }: { sessionId: string }) {
  const action = bulkUploadInternshipRegistrations.bind(null, sessionId);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-3">
      <input
        type="file"
        name="csv"
        accept=".csv,text/csv"
        required
        className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="skipDuplicates" defaultChecked />
        Skip duplicate roll numbers (rather than report as errors)
      </label>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Upload & Import"}
      </button>

      {state && (
        <div className="mt-4 space-y-2">
          {typeof state.imported === "number" && state.imported > 0 && (
            <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
              Imported {state.imported} registration{state.imported === 1 ? "" : "s"}.
            </p>
          )}
          {state.errors && state.errors.length > 0 && (
            <div className="text-sm text-orange-800 bg-orange-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Notes / errors:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {state.errors.map((e: string, i: number) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
