import Link from "next/link";
import Image from "next/image";

export function PublicNavbar() {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
        <Link href="/" className="inline-block">
          <Image
            src="/assets/logo.png"
            alt="HPS World is My Oyster"
            width={240}
            height={64}
            priority
            style={{ width: "auto", height: "64px" }}
          />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-primary transition"
          >
            Home
          </Link>
          <details className="relative group">
            <summary className="list-none cursor-pointer text-sm text-gray-600 hover:text-primary transition inline-flex items-center gap-1 select-none">
              Newsletter
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
              <a
                href="/newsletter/annual-report-25-26/"
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition"
              >
                Annual Report 25-26
              </a>
            </div>
          </details>
          <a
            href="https://www.hpssoaringeagles.org/begumpet/endowment/world_is_my_oyster"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#BD974A] text-white text-sm font-bold shadow-sm hover:bg-[#a4843d] hover:shadow transition"
          >
            Contribute
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
