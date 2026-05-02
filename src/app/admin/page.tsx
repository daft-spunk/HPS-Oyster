import Link from "next/link";
import { getAllSpeakers, getAllCompanies } from "@/lib/actions/library";
import { getAllTalkSessions } from "@/lib/actions/talks";
import { getAllInternshipSessions } from "@/lib/actions/internships";

export default async function AdminDashboard() {
  const [speakerList, companyList, talkList, internList] = await Promise.all([
    getAllSpeakers(),
    getAllCompanies(),
    getAllTalkSessions(),
    getAllInternshipSessions(),
  ]);

  const activeTalks = talkList.filter((s) => s.isActive);
  const activeInterns = internList.filter((i) => i.isActive);
  const totalTalkRegs = talkList.reduce((sum, s) => sum + Number(s.registrationCount), 0);
  const totalInternRegs = internList.reduce((sum, i) => sum + Number(i.registrationCount), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Program overview and quick actions</p>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionCard href="/admin/library/speakers/new" icon="👤" label="Add Speaker" />
          <ActionCard href="/admin/library/companies/new" icon="🏢" label="Add Company" />
          <ActionCard href="/admin/talk-sessions/new" icon="🎤" label="New Talk Session" />
          <ActionCard href="/admin/internship-sessions/new" icon="💼" label="New Internship Session" />
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Library
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Speakers" value={speakerList.length} href="/admin/library/speakers" />
          <StatCard label="Companies" value={companyList.length} href="/admin/library/companies" />
          <StatCard label="Talk Sessions" value={talkList.length} href="/admin/talk-sessions" />
          <StatCard label="Internship Sessions" value={internList.length} href="/admin/internship-sessions" />
        </div>
      </section>

      {/* Currently Active */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Currently Active
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Talk Sessions Live on Site</h3>
              <Link href="/admin/talk-sessions" className="text-xs text-blue-600 hover:underline">
                Manage →
              </Link>
            </div>
            {activeTalks.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {activeTalks.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span>
                      <Link
                        href={`/admin/talk-sessions/${s.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {s.title}
                      </Link>
                      <span className="text-gray-500"> · Class {s.targetClass}</span>
                    </span>
                    <span className="text-gray-600">
                      {Number(s.registrationCount)} regs
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">None active</p>
            )}
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
              Total registrations all time: {totalTalkRegs}
            </p>
          </div>

          <div className="bg-white rounded-lg border p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Internship Session Live on Site</h3>
              <Link href="/admin/internship-sessions" className="text-xs text-blue-600 hover:underline">
                Manage →
              </Link>
            </div>
            {activeInterns.length > 0 ? (
              <div className="space-y-3">
                {activeInterns.map((intern) => (
                  <div key={intern.id} className="text-sm">
                    <Link
                      href={`/admin/internship-sessions/${intern.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {intern.title}
                    </Link>
                    <span className="text-gray-500"> · Class {intern.targetClass}</span>
                    <p className="text-gray-500 mt-1">
                      {Number(intern.companyCount)} companies ·{" "}
                      {Number(intern.registrationCount)} registrations
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">None active</p>
            )}
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
              Total registrations all time: {totalInternRegs}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white rounded-lg border p-4 hover:border-blue-400 hover:shadow-sm transition"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </Link>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg border p-4 hover:border-blue-400 transition block"
    >
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </Link>
  );
}
