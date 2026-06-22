import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="إدارة البنوك" description="إنشاء الحسابات البنكية وربطها بالمدفوعات والتحويلات والتقارير." api="/api/treasury/banks" fields={['company_id','branch_id','name_ar','bank_name','iban','currency','balance']}  /></AppShell>;
}
