import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        {backHref && (
          <Link href={backHref} className="text-sm text-gray-500 hover:underline mb-1 inline-block">
            ← {backLabel || "Back"}
          </Link>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
