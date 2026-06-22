import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="حركات المخزون" description="تسجيل صرف أو استلام أو تسوية مخزون مع طبقة تقييم عند توفر التكلفة." api="/api/inventory/movements" fields={['company_id','branch_id','warehouse_id','item_id','direction','quantity','unit_cost','movement_date','reference_no']}  /></AppShell>;
}
