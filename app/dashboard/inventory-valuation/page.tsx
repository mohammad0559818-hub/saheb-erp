import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="تقييم المخزون" description="عرض تقييم المخزون حسب الشركة والمستودع والصنف من طبقات التكلفة الفعلية." api="/api/inventory/valuation" fields={['company_id','warehouse_id','item_id']} method="GET" /></AppShell>;
}
