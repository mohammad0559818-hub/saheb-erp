import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="مرتجعات المبيعات" description="تسجيل مرتجعات العملاء مع احتساب الضريبة وإرجاع الكميات إلى المستودع عبر حركات المخزون." api="/api/sales/returns" fields={['company_id','branch_id','warehouse_id','customer_id','sales_invoice_id','return_no','return_date','lines']}  /></AppShell>;
}
