import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="عروض الأسعار" description="إنشاء عروض أسعار ضريبية متعددة البنود مرتبطة بالعملاء وقابلة للتحويل لاحقاً لفواتير مبيعات." api="/api/sales/quotations" fields={['company_id','branch_id','customer_id','quotation_no','issue_date','valid_until','lines']}  /></AppShell>;
}
