import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="مطابقة الموردين" description="مطابقة كشوف الموردين مع فواتير المشتريات والمدفوعات." api="/api/suppliers/reconciliation" fields={['company_id', 'supplier_id', 'statement_balance', 'name_ar']} /></AppShell>;
}
