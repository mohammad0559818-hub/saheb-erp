import { ModuleCard } from "@/components/module-card";
import { erpModules } from "@/lib/modules";

const metrics = [
  ["الشركات", "Supabase"], ["المستودعات", "RLS"], ["الفواتير", "API"], ["الثروة", "Live"], ["المطابقات", "Workflow"], ["فروقات AI", "Rules"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),#f8fafc]">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <nav className="flex items-center justify-between rounded-full border border-white/70 bg-white/80 px-6 py-4 shadow-sm backdrop-blur">
          <strong className="text-2xl text-blue-900">SAHEB ERP | صاحب</strong>
          <a className="rounded-full bg-blue-700 px-5 py-2.5 font-semibold text-white" href="/auth/login">دخول النظام</a>
        </nav>
        <div className="grid gap-8 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">جاهز للسعودية والإمارات، VAT متعدد، وشركات متعددة</p>
            <h1 className="text-5xl font-black leading-tight text-slate-950 md:text-7xl">نظام ERP عربي شامل من المطابقة إلى الثروة.</h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-700">SAHEB ERP يجمع المحاسبة، المخزون، مكتب شحن دبي، الخزنة الرئيسية، العقود، صلاحيات الأدوار، المندوبين الجوالين، تحليل الفروقات بالذكاء الاصطناعي، ولوحة الثروة.</p>
            <div className="mt-8 flex gap-3"><a className="rounded-2xl bg-blue-700 px-6 py-3 font-bold text-white" href="/dashboard">لوحة التحكم</a><a className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-bold" href="/api/erp">فهرس APIs</a></div>
          </div>
          <div className="rounded-[2rem] border border-white bg-white/85 p-6 shadow-2xl">
            <div className="grid grid-cols-2 gap-4">{metrics.map(([k, v]) => <div className="rounded-3xl bg-slate-50 p-5" key={k}><p className="text-sm text-slate-500">{k}</p><p className="mt-2 text-3xl font-black text-blue-900">{v}</p></div>)}</div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{erpModules.map((m) => <ModuleCard key={m.key} moduleKey={m.key} label={m.label} description={m.description} />)}</div>
      </section>
    </main>
  );
}
