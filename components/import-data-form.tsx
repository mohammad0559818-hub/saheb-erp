"use client";

import { useState, type FormEvent } from "react";

type ImportState = { type: "idle" | "success" | "error"; message: string };

export function ImportDataForm() {
  const [state, setState] = useState<ImportState>({ type: "idle", message: "" });
  const [preview, setPreview] = useState("");

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState({ type: "idle", message: "جاري استيراد الملف إلى Supabase..." });
    const response = await fetch("/api/system/import-data", { method: "POST", body: new FormData(form) });
    const result = await response.json().catch(() => ({}));
    setPreview(JSON.stringify(result, null, 2));
    if (!response.ok) {
      setState({ type: "error", message: result.error ?? "تعذر استيراد البيانات" });
      return;
    }
    setState({ type: "success", message: "تم استيراد البيانات وتسجيل مهمة الاستيراد بنجاح" });
    form.reset();
  }

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-sm">
      <p className="text-sm font-bold text-blue-700">/api/system/import-data</p>
      <h1 className="mt-2 text-4xl font-black">استيراد بيانات من ERP آخر</h1>
      <p className="mt-3 leading-8 text-slate-600">يرسل النموذج ملف CSV/Excel إلى واجهة الاستيراد، يضيف company_id تلقائياً للصفوف، ويخزن سجل الاستيراد والأخطاء في Supabase.</p>
      <form className="mt-6 grid gap-4" onSubmit={handleImport}>
        <input className="rounded-xl border p-3" name="company_id" placeholder="company_id" required />
        <input className="rounded-xl border p-3" name="source_system" placeholder="النظام المصدر" />
        <input className="rounded-xl border p-3" name="target_table" placeholder="target_table مثل customers أو inventory_items" required />
        <input className="rounded-xl border p-3" name="file" type="file" accept=".csv,.xlsx,.xls,text/csv" required />
        <button className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white">استيراد ومزامنة</button>
      </form>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">صيغة CSV المطلوبة: الصف الأول أسماء الأعمدة المطابقة للجدول الهدف، وكل صف بعده سجل تشغيلي حقيقي.</div>
      {state.message ? <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${state.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{state.message}</p> : null}
      {preview ? <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs text-emerald-200" dir="ltr">{preview}</pre> : null}
    </section>
  );
}
