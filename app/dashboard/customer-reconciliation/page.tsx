import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="مطابقة العملاء" description="مطابقة كشوف العملاء مع فواتير ERP والتحصيلات وفتح فروقات للمراجعة." api="/api/customers/reconciliation" fields={['company_id', 'customer_id', 'statement_balance', 'name_ar']} /></AppShell>;
}
