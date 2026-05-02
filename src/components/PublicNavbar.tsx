import Link from "next/link";
import Image from "next/image";

export function PublicNavbar() {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
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
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-primary transition"
        >
          Home
        </Link>
      </div>
    </nav>
  );
}
