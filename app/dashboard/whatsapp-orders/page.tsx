import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="طلبات واتساب" description="معالجة طلبات واتساب وتحويل الطلبات المطابقة إلى فواتير مبيعات مسودة." api="/api/whatsapp/orders" fields={['company_id','branch_id','customer_phone','message','customer_id','warehouse_id','lines','status']}  /></AppShell>;
}
