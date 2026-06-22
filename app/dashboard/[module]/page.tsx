import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getModule } from "@/lib/modules";
import { ModuleForm } from "@/components/module-form";

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: key } = await params;
  const module = getModule(key);
  if (!module) notFound();

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <a href="/dashboard" className="text-blue-700">← العودة</a>
        <section className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-4xl font-black">{module.label}</h1>
              <p className="mt-3 text-lg text-slate-600">{module.description}</p>
            </div>
            <code className="rounded-2xl bg-blue-50 px-4 py-3 text-blue-900">/api/erp/{module.key}</code>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5"><p className="font-bold">جدول البيانات</p><code>{module.table}</code></div>
            <div className="rounded-2xl bg-slate-50 p-5"><p className="font-bold">العمليات</p><p className="text-sm text-slate-600">إضافة، تعديل، حذف، بحث، تصفية حسب الشركة/الفرع</p></div>
            <div className="rounded-2xl bg-slate-50 p-5"><p className="font-bold">الحماية</p><p className="text-sm text-slate-600">RLS + صلاحيات الدور + سجل تدقيق</p></div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <ModuleForm module={module} />

            <div className="rounded-3xl border p-5">
              <h2 className="text-2xl font-black">سير العمل</h2>
              <ol className="mt-5 space-y-3">
                {module.workflows.map((workflow, index) => (
                  <li key={workflow} className="flex gap-3 rounded-2xl bg-slate-50 p-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{index + 1}</span><span className="font-semibold">{workflow}</span></li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
