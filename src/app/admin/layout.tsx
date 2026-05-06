import Link from "next/link";
import Image from "next/image";
import { logoutAction } from "@/lib/actions/auth";
import { isAuthenticated } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#132E5A] text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/admin" className="block">
            <Image
              src="/assets/logo.png"
              alt="HPS World is My Oyster"
              width={200}
              height={56}
              priority
              style={{ width: "auto", height: "44px" }}
            />
          </Link>
          <p className="text-xs text-blue-200 mt-2">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-300 px-2 mb-2">
              Overview
            </p>
            <SidebarLink href="/admin">Dashboard</SidebarLink>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-blue-300 px-2 mb-2">
              Library
            </p>
            <SidebarLink href="/admin/library/speakers">Speakers</SidebarLink>
            <SidebarLink href="/admin/library/companies">Companies</SidebarLink>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-blue-300 px-2 mb-2">
              Sessions
            </p>
            <SidebarLink href="/admin/talk-sessions">Talk Sessions</SidebarLink>
            <SidebarLink href="/admin/internship-sessions">
              Internship Sessions
            </SidebarLink>
          </div>
        </nav>

        <div className="px-3 py-3 border-t border-white/10 space-y-1 text-sm">
          <Link
            href="/"
            target="_blank"
            className="block px-2 py-1.5 text-blue-200 hover:text-white"
          >
            View Public Site ↗
          </Link>
          <form action={logoutAction}>
            <button className="block w-full text-left px-2 py-1.5 text-blue-200 hover:text-white">
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-8 py-8 overflow-x-auto">{children}</main>
    </div>
  );
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-2 py-1.5 rounded hover:bg-white/10 transition"
    >
      {children}
    </Link>
  );
}
