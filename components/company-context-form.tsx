"use client";

import { useEffect, useState, type FormEvent } from "react";

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").find((part) => part.startsWith(`${name}=`))?.split("=")[1] ?? "";
}

export function CompanyContextForm() {
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    setCompanyId(readCookie("saheb_company_id"));
  }, []);

  function saveCompanyContext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId.trim()) return;
    document.cookie = `saheb_company_id=${companyId.trim()}; path=/; max-age=28800; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <form className="mt-5 grid gap-2 rounded-2xl bg-slate-50 p-3" onSubmit={saveCompanyContext}>
      <label className="text-xs font-bold text-slate-500">الشركة النشطة</label>
      <input className="rounded-xl border p-2 text-sm" value={companyId} onChange={(event) => setCompanyId(event.target.value)} placeholder="company_id من Supabase" required />
      <button className="rounded-xl bg-emerald-700 p-2 text-sm font-bold text-white">حفظ سياق الشركة</button>
    </form>
  );
}
