import Link from "next/link";
import { getAllSpeakers, deleteSpeaker } from "@/lib/actions/library";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function SpeakersLibraryPage() {
  const speakers = await getAllSpeakers();

  return (
    <div>
      <PageHeader
        title="Speakers Library"
        subtitle="Reusable pool of alumni speakers. Add once, link to many sessions."
        action={
          <Link
            href="/admin/library/speakers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            + Add Speaker
          </Link>
        }
      />

      {speakers.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500 mb-4">No speakers in the library yet.</p>
          <Link
            href="/admin/library/speakers/new"
            className="text-blue-600 hover:underline text-sm"
          >
            Add your first speaker →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500">House</th>
                <th className="px-4 py-3 font-medium text-gray-500">Batch</th>
                <th className="px-4 py-3 font-medium text-gray-500">Used in</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {speakers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/library/speakers/${s.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.house || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.batchYear || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {Number(s.timesUsed) > 0
                      ? `${Number(s.timesUsed)} session${Number(s.timesUsed) > 1 ? "s" : ""}`
                      : "Not yet used"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/library/speakers/${s.id}`}
                      className="px-2 py-1 text-xs border rounded hover:bg-gray-50 mr-2"
                    >
                      Edit
                    </Link>
                    <form action={deleteSpeaker.bind(null, s.id)} className="inline">
                      <button className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
