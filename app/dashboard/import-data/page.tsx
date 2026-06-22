import { AppShell } from "@/components/app-shell";
import { ImportDataForm } from "@/components/import-data-form";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <ImportDataForm />
        <ResourceScreen title="سجل مهام الاستيراد" description="عرض وتحديث وحذف سجلات import_jobs الناتجة عن عمليات استيراد CSV/Excel." api="/api/system/import-data" fields={["company_id","source_system","target_table","file_name","status"]} method="GET" />
      </main>
    </AppShell>
  );
}
