"use client";

import { useState, type FormEvent } from "react";

type UploadState = { type: "idle" | "success" | "error"; message: string };

export function AttachmentUploader() {
  const [state, setState] = useState<UploadState>({ type: "idle", message: "" });
  const [preview, setPreview] = useState("");

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    if (!(file instanceof File)) {
      setState({ type: "error", message: "يرجى اختيار ملف PDF أو صورة أو Excel" });
      return;
    }

    setState({ type: "idle", message: "جاري إنشاء رابط الرفع الآمن..." });
    const payload = {
      company_id: String(formData.get("company_id") ?? ""),
      branch_id: String(formData.get("branch_id") ?? ""),
      file_name: file.name,
      content_type: file.type,
      subject_table: String(formData.get("subject_table") ?? ""),
      subject_id: String(formData.get("subject_id") ?? ""),
    };

    const response = await fetch("/api/attachments/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPreview(JSON.stringify(result, null, 2));
      setState({ type: "error", message: result.error ?? "تعذر إنشاء رابط الرفع" });
      return;
    }

    const uploadUrl = result.upload?.signedUrl ?? result.upload?.url;
    if (!uploadUrl) {
      setPreview(JSON.stringify(result, null, 2));
      setState({ type: "error", message: "لم يرجع Supabase رابط رفع صالح" });
      return;
    }

    setState({ type: "idle", message: "جاري رفع الملف إلى Supabase Storage..." });
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: file.type ? { "content-type": file.type } : undefined,
      body: file,
    });
    setPreview(JSON.stringify({ ...result, storage_upload_status: uploadResponse.status }, null, 2));
    if (!uploadResponse.ok) {
      setState({ type: "error", message: "تم إنشاء سجل المرفق لكن فشل رفع الملف إلى Storage" });
      return;
    }

    setState({ type: "success", message: "تم رفع الملف وربطه بسجل المرفقات بنجاح" });
    form.reset();
  }

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black">رفع ملف فعلي إلى Supabase Storage</h2>
      <p className="mt-3 leading-8 text-slate-600">يدعم PDF والصور وملفات Excel/CSV. يتم إنشاء سجل attachments ثم رفع الملف إلى الرابط الموقّع من Supabase.</p>
      <form className="mt-5 grid gap-4" onSubmit={handleUpload}>
        <input className="rounded-xl border p-3" name="company_id" placeholder="company_id" required />
        <input className="rounded-xl border p-3" name="branch_id" placeholder="branch_id اختياري" />
        <input className="rounded-xl border p-3" name="subject_table" placeholder="subject_table مثل contracts أو mobile_sales_representatives" />
        <input className="rounded-xl border p-3" name="subject_id" placeholder="subject_id" />
        <input className="rounded-xl border p-3" name="file" type="file" accept=".pdf,image/*,.xls,.xlsx,.csv" required />
        <button className="rounded-xl bg-blue-700 p-3 font-bold text-white" type="submit">رفع وربط الملف</button>
      </form>
      {state.message ? <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${state.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{state.message}</p> : null}
      {preview ? <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs text-emerald-200" dir="ltr">{preview}</pre> : null}
    </section>
  );
}
