"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        const token = data?.access_token ?? data?.session?.access_token;
        if (token) {
          document.cookie = `saheb_access_token=${token}; path=/; max-age=28800; SameSite=Lax`;
          const profile = await fetch("/api/auth/me", { headers: { authorization: `Bearer ${token}` } }).then((response) => response.json()).catch(() => null);
          if (profile?.active_company_id) document.cookie = `saheb_company_id=${profile.active_company_id}; path=/; max-age=28800; SameSite=Lax`;
        }
        window.location.href = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl" onSubmit={(event) => { event.preventDefault(); void signIn(); }}>
      <h1 className="text-3xl font-black">تسجيل الدخول</h1>
      <p className="mt-2 text-slate-600">دخول آمن عبر Supabase Auth مع دعم صلاحيات الشركة والفرع.</p>
      <label className="mt-6 block text-sm font-bold">البريد الإلكتروني<input className="mt-2 w-full rounded-xl border p-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@company.com" required /></label>
      <label className="mt-4 block text-sm font-bold">كلمة المرور<input className="mt-2 w-full rounded-xl border p-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {message ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}
      <button className="mt-6 w-full rounded-xl bg-blue-700 p-3 font-bold text-white disabled:opacity-60" type="submit" disabled={loading}>{loading ? "جارٍ الدخول..." : "دخول"}</button>
    </form>
  );
}
