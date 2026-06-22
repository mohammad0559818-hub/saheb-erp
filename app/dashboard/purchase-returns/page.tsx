import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="مرتجعات المشتريات" description="تسجيل مرتجعات الموردين مع خفض المخزون وتوثيق إجماليات الضريبة والبنود." api="/api/purchases/returns" fields={['company_id','branch_id','warehouse_id','supplier_id','purchase_invoice_id','return_no','return_date','lines']}  /></AppShell>;
}
