import { getCompany } from "@/lib/actions/library";
import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EditCompanyForm } from "./EditCompanyForm";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Edit: ${company.name}`}
        backHref="/admin/library/companies"
        backLabel="Back to Companies"
      />
      <EditCompanyForm company={company} />
    </div>
  );
}
