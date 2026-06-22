import { AppShell } from "@/components/app-shell";
import { ModuleCard } from "@/components/module-card";
import { erpModules } from "@/lib/modules";

const stats = ["إجمالي المبيعات", "تحصيلات العملاء", "فواتير الشراء", "مدفوعات الموردين", "فروقات AI", "صافي الثروة"];

async function loadKpis() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const companyId = process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID;
  if (!baseUrl || !companyId) return { sales_total: 0, collection_total: 0, purchase_total: 0, supplier_payment_total: 0, ai_discrepancies: 0, net_worth: 0 };
  try {
    const [kpiResponse, wealthResponse] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/kpis?company_id=${companyId}`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/wealth/summary?company_id=${companyId}`, { cache: "no-store" }),
    ]);
    const kpis = kpiResponse.ok ? await kpiResponse.json() : {};
    const wealth = wealthResponse.ok ? await wealthResponse.json() : {};
    return { sales_total: kpis.sales_total ?? 0, collection_total: kpis.collection_total ?? 0, purchase_total: kpis.purchase_total ?? 0, supplier_payment_total: kpis.payment_total ?? 0, ai_discrepancies: kpis.ai_discrepancies ?? 0, net_worth: wealth.net_worth ?? 0 };
  } catch {
    return { sales_total: 0, collection_total: 0, purchase_total: 0, supplier_payment_total: 0, ai_discrepancies: 0, net_worth: 0 };
  }
}

export default async function Dashboard() {
  const kpis = await loadKpis();
  const values = [kpis.sales_total, kpis.collection_total, kpis.purchase_total, kpis.supplier_payment_total, kpis.ai_discrepancies, kpis.net_worth].map((value) => Number(value ?? 0));
  const max = Math.max(...values.map(Math.abs), 1);
  return <AppShell><main className="mx-auto max-w-7xl px-6 py-10"><h1 className="text-4xl font-black">لوحة تحكم صاحب ERP</h1><p className="mt-3 text-slate-600">إدارة مركزية متعددة الشركات والفروع والمستودعات مع صلاحيات وموافقات وسجل تدقيق وتحليل فروقات ذكي.</p><div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">{stats.map((item, index) => <div className="rounded-3xl bg-white p-5 shadow-sm" key={item}><p className="text-sm text-slate-500">{item}</p><p className="mt-2 text-2xl font-black text-blue-900">{values[index].toLocaleString("ar-SA")} ر.س</p><div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(4, Math.round(Math.abs(values[index]) / max * 100))}%` }} /></div></div>)}</div><section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm"><h2 className="text-2xl font-black">مؤشرات الأداء</h2><div className="mt-6 flex h-52 items-end gap-4">{values.map((value, index) => <div key={stats[index]} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-2xl bg-emerald-500" style={{ height: `${Math.max(4, Math.round(Math.abs(value) / max * 100))}%` }} /><span className="text-xs text-slate-500">{stats[index]}</span></div>)}</div></section><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{erpModules.map((m) => <ModuleCard key={m.key} moduleKey={m.key} label={m.label} description={m.description} />)}</div></main></AppShell>;
}
