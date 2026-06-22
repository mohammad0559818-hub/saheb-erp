import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="مدفوعات الموردين" description="تسجيل سندات دفع الموردين من الصناديق أو الحسابات البنكية وربطها بالفواتير." api="/api/suppliers/payments" fields={['company_id','branch_id','supplier_id','amount','paid_at','cashbox_id','bank_account_id','reference_no']}  /></AppShell>;
}
