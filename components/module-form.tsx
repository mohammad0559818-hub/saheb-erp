"use client";

import { useState, type FormEvent } from "react";
import type { ErpModule } from "@/lib/modules";

function coerce(value: FormDataEntryValue) {
  const text = String(value).trim();
  if (!text) return undefined;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
}

export function ModuleForm({ module }: { module: ErpModule }) {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries([...new FormData(event.currentTarget).entries()].map(([key, value]) => [key, coerce(value)]).filter(([, value]) => value !== undefined));
    const response = await fetch(`/api/erp/${module.key}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    setMessage(response.ok ? "تم حفظ السجل في Supabase" : result.error ?? "تعذر الحفظ");
    if (response.ok) event.currentTarget.reset();
  }
  return (
    <form className="rounded-3xl border p-5" onSubmit={submit}>
      <h2 className="text-2xl font-black">نموذج إدخال عربي</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {module.fields.map((field) => (
          <label key={field.name} className="block text-sm font-bold text-slate-700">
            {field.label}{field.required ? " *" : ""}
            <input className="mt-2 w-full rounded-xl border border-slate-200 p-3" name={field.name} required={field.required} type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} placeholder={field.name} />
          </label>
        ))}
      </div>
      <button className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white" type="submit">حفظ</button>
      {message ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">{message}</p> : null}
    </form>
  );
}
