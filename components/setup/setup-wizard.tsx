"use client";

import { useState, type FormEvent } from "react";

type SetupState = { type: "idle" | "success" | "error"; message: string };

export function SetupWizard() {
  const [state, setState] = useState<SetupState>({ type: "idle", message: "" });
  const [result, setResult] = useState("");

  async function submitSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    setState({ type: "idle", message: "جاري إنشاء الشركة والمالك في Supabase..." });
    const response = await fetch("/api/setup/owner", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    setResult(JSON.stringify(body, null, 2));
    if (!response.ok) {
      setState({ type: "error", message: body.error ?? "تعذر إكمال الإعداد" });
      return;
    }
    if (body.company?.id) document.cookie = `saheb_company_id=${body.company.id}; path=/; max-age=28800; SameSite=Lax`;
    setState({ type: "success", message: "تم إنشاء الشركة والمالك. سجّل الدخول الآن بنفس بيانات المالك." });
    form.reset();
  }

  return (
    <form className="mx-auto w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-xl" onSubmit={submitSetup}>
      <p className="text-sm font-bold text-emerald-700">إعداد إنتاجي أولي عبر Supabase</p>
      <h1 className="mt-2 text-4xl font-black">إنشاء الشركة والمالك الأول</h1>
      <p className="mt-3 leading-8 text-slate-600">هذه الخطوة تنشئ مستخدم Supabase Auth، شركة إنتاجية، عضوية مالك، وسجل تدقيق. بعد وجود شركة، يتم إغلاق المعالج تلقائياً لحماية النظام.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input className="rounded-xl border p-3" name="company_name_ar" placeholder="اسم الشركة بالعربية" required />
        <select className="rounded-xl border p-3" name="country" defaultValue="SA">
          <option value="SA">السعودية</option>
          <option value="AE">الإمارات</option>
        </select>
        <input className="rounded-xl border p-3" name="owner_name_ar" placeholder="اسم المالك" required />
        <input className="rounded-xl border p-3" name="owner_email" type="email" placeholder="owner@company.com" required />
        <input className="rounded-xl border p-3 md:col-span-2" name="owner_password" type="password" placeholder="كلمة مرور قوية" minLength={8} required />
      </div>
      <button className="mt-6 w-full rounded-xl bg-blue-700 p-3 font-bold text-white">إنشاء النظام الإنتاجي</button>
      {state.message ? <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${state.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{state.message}</p> : null}
      {result ? <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs text-emerald-200" dir="ltr">{result}</pre> : null}
    </form>
  );
}
