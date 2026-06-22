"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

export type ResourceAction = { label: string; href: string };

type SubmitState = { type: "idle" | "success" | "error"; message: string };
type RecordRow = Record<string, unknown>;

const apiListMap: Record<string, string> = {
  "/api/system/backup-restore": "/api/erp/backup_jobs",
  "/api/system/backup-export": "/api/erp/backup_jobs",
  "/api/system/import-data": "/api/erp/import_jobs",
  "/api/sales/quotations": "/api/erp/sales_quotations",
  "/api/sales/returns": "/api/erp/sales_returns",
  "/api/purchases/returns": "/api/erp/purchase_returns",
  "/api/attachments/link": "/api/erp/attachments",
  "/api/attachments/upload": "/api/erp/attachments",
  "/api/mobile-sales/representatives": "/api/erp/mobile_sales",
  "/api/ai/discrepancies": "/api/erp/ai_discrepancy_analysis",
  "/api/permissions/check": "/api/erp/role_permissions",
  "/api/customers/collections": "/api/erp/customers",
  "/api/customers/reconciliation": "/api/erp/customer_reconciliations",
  "/api/suppliers/payments": "/api/erp/suppliers",
  "/api/suppliers/reconciliation": "/api/erp/supplier_reconciliations",
  "/api/dubai-shipping/shipments": "/api/erp/dubai_shipping_office",
  "/api/contracts": "/api/erp/contracts",
  "/api/accounting/journals": "/api/erp/accounting",
  "/api/inventory/movements": "/api/erp/inventory",
  "/api/warehouses/transfers": "/api/erp/transfers",
  "/api/treasury/transfers": "/api/erp/transfers",
  "/api/treasury/cashboxes": "/api/erp/cashboxes",
  "/api/treasury/banks": "/api/erp/banks",
  "/api/treasury/main-vault": "/api/erp/main_vault",
  "/api/vat/documents": "/api/erp/multi_vat",
  "/api/whatsapp/orders": "/api/erp/sales",
};

function normalizeValue(value: FormDataEntryValue) {
  const text = String(value).trim();
  if (text === "") return undefined;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if (text === "true") return true;
  if (text === "false") return false;
  try {
    if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) return JSON.parse(text);
  } catch {
    return text;
  }
  return text;
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").find((part) => part.startsWith(`${name}=`))?.split("=")[1] ?? "";
}

export function ResourceScreen({ title, description, api, fields, actions = [], method = "POST", listApi }: { title: string; description: string; api: string; fields: string[]; actions?: ResourceAction[]; method?: "GET" | "POST"; listApi?: string }) {
  const [state, setState] = useState<SubmitState>({ type: "idle", message: "" });
  const [resultPreview, setResultPreview] = useState("");
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [listState, setListState] = useState<SubmitState>({ type: "idle", message: "" });
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const effectiveListApi = useMemo(() => listApi ?? (api.startsWith("/api/erp/") ? api : apiListMap[api]), [api, listApi]);

  async function loadRows(nextSearch = search, nextCompanyId = companyId) {
    if (!effectiveListApi) return;
    setListState({ type: "idle", message: "جاري تحميل السجلات..." });
    const params = new URLSearchParams({ limit: "25" });
    if (nextSearch) params.set("search", nextSearch);
    if (nextCompanyId) params.set("company_id", nextCompanyId);
    const response = await fetch(`${effectiveListApi}?${params.toString()}`, { method: "GET" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setRows([]);
      setCount(null);
      setListState({ type: "error", message: result.error ?? "تعذر تحميل السجلات" });
      return;
    }
    setRows(Array.isArray(result.data) ? result.data : []);
    setCount(typeof result.count === "number" ? result.count : Array.isArray(result.data) ? result.data.length : null);
    setListState({ type: "success", message: "تم تحميل السجلات من Supabase" });
  }

  useEffect(() => {
    const cookieCompanyId = getCookieValue("saheb_company_id");
    if (cookieCompanyId && !companyId) setCompanyId(cookieCompanyId);
    if (effectiveListApi) void loadRows("", cookieCompanyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveListApi]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ type: "idle", message: "جاري الحفظ..." });
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, normalizeValue(value)]).filter(([, value]) => value !== undefined));
    if (!payload.company_id && companyId) payload.company_id = companyId;
    const target = method === "GET" ? `${api}?${new URLSearchParams(Object.entries(payload).map(([key, value]) => [key, String(value)])).toString()}` : api;
    const response = await fetch(target, method === "GET" ? { method } : { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setResultPreview(JSON.stringify(result, null, 2));
      setState({ type: "error", message: result.error ?? "تعذر تنفيذ العملية" });
      return;
    }
    setResultPreview(JSON.stringify(result, null, 2));
    setState({ type: "success", message: "تم تنفيذ الطلب والمزامنة مع Supabase بنجاح" });
    if (method === "POST") event.currentTarget.reset();
    await loadRows();
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadRows(search, companyId);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!effectiveListApi || !editId) return;
    const formData = new FormData(event.currentTarget);
    const changes = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, normalizeValue(value)]).filter(([, value]) => value !== undefined));
    const response = await fetch(effectiveListApi, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: editId, ...changes }) });
    const result = await response.json().catch(() => ({}));
    setResultPreview(JSON.stringify(result, null, 2));
    if (!response.ok) {
      setState({ type: "error", message: result.error ?? "تعذر تحديث السجل" });
      return;
    }
    setState({ type: "success", message: "تم تحديث السجل بنجاح" });
    setEditId("");
    event.currentTarget.reset();
    await loadRows();
  }

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!effectiveListApi || !deleteId) return;
    const params = new URLSearchParams({ id: deleteId });
    if (companyId) params.set("company_id", companyId);
    const response = await fetch(`${effectiveListApi}?${params.toString()}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    setResultPreview(JSON.stringify(result, null, 2));
    if (!response.ok) {
      setState({ type: "error", message: result.error ?? "تعذر حذف السجل" });
      return;
    }
    setState({ type: "success", message: "تم حذف السجل بنجاح" });
    setDeleteId("");
    await loadRows();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-bold text-blue-700">{api}</p>
        <h1 className="mt-2 text-4xl font-black">{title}</h1>
        <p className="mt-3 max-w-3xl leading-8 text-slate-600">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {actions.map((action) => <a key={action.href} className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white" href={action.href}>{action.label}</a>)}
          <a className="rounded-xl border px-4 py-2 font-bold" href={`${api}?format=xls`}>Excel</a>
          <a className="rounded-xl border px-4 py-2 font-bold" href={`${api}?format=csv`}>CSV</a>
          <a className="rounded-xl border px-4 py-2 font-bold" href={`${api}?format=pdf`}>PDF</a>
        </div>
      </div>
      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <form className="rounded-[2rem] bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-black">إنشاء / تشغيل Workflow</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {fields.map((field) => <label className="text-sm font-bold text-slate-700" key={field}>{field}<input className="mt-2 w-full rounded-xl border p-3" name={field} placeholder={field} /></label>)}
          </div>
          <button className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white" type="submit">تنفيذ ومزامنة</button>
          {state.message ? <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${state.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{state.message}</p> : null}
          {resultPreview ? <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs text-emerald-200" dir="ltr">{resultPreview}</pre> : null}
        </form>
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">متصل بالبيانات والصلاحيات</h2>
          <p className="mt-3 leading-8 text-slate-600">هذه الشاشة تنفذ الطلب مباشرة على واجهة API الموضحة أعلاه وتستخدم جداول Supabase المقابلة مع صلاحيات الشركة والمستخدم. كما تعرض السجلات وتدعم البحث والتعديل والحذف عندما يتوفر مسار CRUD عام للوحدة.</p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">{fields.map((field) => <li key={field} className="rounded-xl bg-slate-50 p-3">{field}</li>)}</ul>
        </div>
      </section>
      {effectiveListApi ? (
        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-emerald-700">{effectiveListApi}</p>
              <h2 className="mt-1 text-2xl font-black">قائمة السجلات والبحث والتعديل والحذف</h2>
              <p className="mt-2 text-sm text-slate-600">العدد المعروض: {count ?? rows.length}</p>
            </div>
            <button className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white" type="button" onClick={() => void loadRows()}>تحديث القائمة</button>
          </div>
          <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSearch}>
            <input className="rounded-xl border p-3" value={companyId} onChange={(event) => setCompanyId(event.target.value)} placeholder="company_id للتصفية والصلاحيات" />
            <input className="rounded-xl border p-3" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث بالاسم العربي" />
            <button className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white">بحث / List</button>
          </form>
          {listState.message ? <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${listState.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{listState.message}</p> : null}
          <div className="mt-5 overflow-auto rounded-2xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {["id", "name_ar", "status", "company_id", "created_at", "الإجراءات"].map((header) => <th className="whitespace-nowrap p-3 text-right" key={header}>{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.length ? rows.map((row) => (
                  <tr className="border-t" key={String(row.id ?? JSON.stringify(row))}>
                    {["id", "name_ar", "status", "company_id", "created_at"].map((column) => <td className="max-w-[220px] truncate p-3" key={column}>{String(row[column] ?? "")}</td>)}
                    <td className="whitespace-nowrap p-3">
                      <button className="rounded-lg border px-3 py-1 font-bold" type="button" onClick={() => setEditId(String(row.id ?? ""))}>تعديل</button>
                      <button className="mr-2 rounded-lg border border-red-200 px-3 py-1 font-bold text-red-700" type="button" onClick={() => setDeleteId(String(row.id ?? ""))}>حذف</button>
                    </td>
                  </tr>
                )) : <tr><td className="p-4 text-center text-slate-500" colSpan={6}>لا توجد سجلات مطابقة أو أن الصلاحيات/إعدادات Supabase تمنع العرض.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <form className="rounded-2xl bg-slate-50 p-4" onSubmit={handleUpdate}>
              <h3 className="font-black">تعديل سجل موجود</h3>
              <input className="mt-3 w-full rounded-xl border p-3" value={editId} onChange={(event) => setEditId(event.target.value)} placeholder="id" required />
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {fields.slice(0, 6).map((field) => <input className="rounded-xl border p-3" key={field} name={field} placeholder={`قيمة جديدة: ${field}`} />)}
              </div>
              <button className="mt-3 rounded-xl bg-amber-600 px-4 py-2 font-bold text-white">حفظ التعديل</button>
            </form>
            <form className="rounded-2xl bg-red-50 p-4" onSubmit={handleDelete}>
              <h3 className="font-black text-red-900">حذف سجل</h3>
              <input className="mt-3 w-full rounded-xl border p-3" value={deleteId} onChange={(event) => setDeleteId(event.target.value)} placeholder="id" required />
              <p className="mt-2 text-sm text-red-700">يتم تنفيذ الحذف من API الوحدة مع فحص صلاحية delete وتسجيل Audit Log.</p>
              <button className="mt-3 rounded-xl bg-red-700 px-4 py-2 font-bold text-white">حذف نهائي</button>
            </form>
          </div>
        </section>
      ) : null}
    </main>
  );
}
