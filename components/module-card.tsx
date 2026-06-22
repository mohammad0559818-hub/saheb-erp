import type { ErpModuleKey } from "@/lib/modules";

export function ModuleCard({ label, description, moduleKey }: { label: string; description: string; moduleKey: ErpModuleKey }) {
  return (
    <a href={`/dashboard/${moduleKey}`} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700 group-hover:bg-blue-700 group-hover:text-white">↖</span>
      </div>
    </a>
  );
}
