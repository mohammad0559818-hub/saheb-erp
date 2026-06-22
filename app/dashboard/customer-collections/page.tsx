import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="تحصيلات العملاء" description="تسجيل سندات قبض العملاء وربطها بالصندوق أو البنك ومندوب المبيعات." api="/api/customers/collections" fields={['company_id','branch_id','customer_id','amount','collected_at','cashbox_id','bank_account_id','representative_id','reference_no']}  /></AppShell>;
}
