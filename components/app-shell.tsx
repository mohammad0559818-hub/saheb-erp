import type { ReactNode } from "react";
import { CompanyContextForm } from "@/components/company-context-form";
import { erpModules } from "@/lib/modules";

const enterpriseLinks = [
  ["مطابقة العملاء", "/dashboard/customer-reconciliation"],
  ["مطابقة الموردين", "/dashboard/supplier-reconciliation"],
  ["لوحة الثروة", "/dashboard/wealth"],
  ["مكتب شحن دبي", "/dashboard/dubai-shipping"],
  ["إدارة العقود", "/dashboard/contracts-management"],
  ["المشاريع والاستثمارات", "/dashboard/projects-investments"],
  ["المستخدمون والصلاحيات", "/dashboard/users-roles"],
  ["سير الموافقات", "/dashboard/approval-workflow"],
  ["سجل التدقيق", "/dashboard/audit-logs"],
  ["مركز الإشعارات", "/dashboard/notifications-center"],
  ["التقارير", "/dashboard/reports"],
  ["تحليل AI", "/dashboard/ai-discrepancies"],
  ["المندوبون", "/dashboard/mobile-sales-reps"],
  ["تحصيلات العملاء", "/dashboard/customer-collections"],
  ["مدفوعات الموردين", "/dashboard/supplier-payments"],
  ["المرفقات العامة", "/dashboard/attachments"],
  ["عروض الأسعار", "/dashboard/sales-quotations"],
  ["مرتجعات المبيعات", "/dashboard/sales-returns"],
  ["مرتجعات المشتريات", "/dashboard/purchase-returns"],
  ["قيود اليومية", "/dashboard/accounting-journals"],
  ["حركات المخزون", "/dashboard/inventory-movements"],
  ["تقييم المخزون", "/dashboard/inventory-valuation"],
  ["تحويلات المستودعات", "/dashboard/warehouse-transfers"],
  ["الصناديق", "/dashboard/cashboxes"],
  ["البنوك", "/dashboard/banks"],
  ["الخزنة الرئيسية", "/dashboard/main-vault"],
  ["التحويلات المالية", "/dashboard/treasury-transfers"],
  ["مستندات VAT", "/dashboard/vat-documents"],
  ["طلبات واتساب", "/dashboard/whatsapp-orders"],
  ["النسخ الاحتياطي", "/dashboard/backup-restore"],
  ["استيراد ERP", "/dashboard/import-data"],
  ["الإعدادات", "/dashboard/settings"],
  ["ملف الشركة و VAT", "/dashboard/company-profile"],
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed right-0 top-0 hidden h-full w-80 overflow-y-auto border-l bg-white p-5 lg:block">
        <a href="/dashboard" className="text-2xl font-black text-blue-900">SAHEB ERP</a>
        <CompanyContextForm />
        <form action="/api/search" className="mt-5 grid gap-2"><input name="q" className="rounded-xl border p-2 text-sm" placeholder="بحث عام" /><input name="company_id" className="rounded-xl border p-2 text-sm" placeholder="company_id" /><button className="rounded-xl bg-slate-900 p-2 text-sm font-bold text-white">بحث</button></form><p className="mt-4 text-xs font-bold text-slate-400">شاشات الإنتاج</p>
        <nav className="mt-2 grid gap-1">{enterpriseLinks.map(([label, href]) => <a key={href} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800" href={href}>{label}</a>)}</nav>
        <p className="mt-6 text-xs font-bold text-slate-400">كل الوحدات</p>
        <nav className="mt-2 grid gap-1">
          {erpModules.map((module) => <a key={module.key} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800" href={`/dashboard/${module.key}`}>{module.label}</a>)}
        </nav>
      </aside>
      <div className="lg:pr-80">{children}</div>
    </div>
  );
}
