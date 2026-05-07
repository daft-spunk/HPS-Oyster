import { isAuthenticated } from "@/lib/auth";
import { AdminShell } from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) return <>{children}</>;

  return <AdminShell>{children}</AdminShell>;
}
