"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-[#132E5A] text-white flex items-center justify-between px-4 h-14 shadow">
        <Link href="/admin" className="bg-white rounded-md px-2 py-1">
          <Image
            src="/assets/logo.png"
            alt="HPS World is My Oyster"
            width={140}
            height={32}
            priority
            style={{ width: "auto", height: "28px" }}
          />
        </Link>
        <button
          type="button"
          aria-label="Open admin menu"
          onClick={() => setOpen(true)}
          className="p-2 -mr-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </header>

      <div className="flex md:min-h-screen">
        {/* Sidebar — drawer on mobile, fixed rail on desktop */}
        {open && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/50"
          />
        )}
        <aside
          className={`fixed md:static top-0 left-0 z-50 w-64 md:w-60 h-screen md:h-auto bg-[#132E5A] text-white flex flex-col transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="bg-white px-5 py-4 border-b border-white/10 flex items-center justify-between">
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
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="md:hidden text-gray-500 p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
          <div className="px-5 py-3 border-b border-white/10">
            <p className="text-xs text-blue-200">Admin Panel</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-6 text-sm overflow-y-auto">
            <Section label="Overview">
              <SidebarLink href="/admin" pathname={pathname}>Dashboard</SidebarLink>
            </Section>
            <Section label="Library">
              <SidebarLink href="/admin/library/speakers" pathname={pathname}>Speakers</SidebarLink>
              <SidebarLink href="/admin/library/companies" pathname={pathname}>Companies</SidebarLink>
            </Section>
            <Section label="Sessions">
              <SidebarLink href="/admin/talk-sessions" pathname={pathname}>Talk Sessions</SidebarLink>
              <SidebarLink href="/admin/internship-sessions" pathname={pathname}>Internship Sessions</SidebarLink>
            </Section>
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

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 py-5 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-blue-300 px-2 mb-2">{label}</p>
      {children}
    </div>
  );
}

function SidebarLink({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: React.ReactNode;
}) {
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`block px-2 py-1.5 rounded transition ${
        active ? "bg-white/15 text-white" : "hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}
