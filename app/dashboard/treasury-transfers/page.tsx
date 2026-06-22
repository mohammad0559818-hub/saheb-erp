import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="التحويلات المالية" description="تحويل الأموال بين الصناديق والخزنة الرئيسية والبنوك مع إنشاء حركة نقدية مزدوجة." api="/api/treasury/transfers" fields={['company_id','branch_id','source_type','source_id','destination_type','destination_id','amount','transfer_date','reference_no']}  /></AppShell>;
}
