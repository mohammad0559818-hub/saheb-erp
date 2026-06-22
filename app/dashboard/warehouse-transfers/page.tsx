import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="تحويلات المستودعات" description="تنفيذ تحويل مخزني بين مستودعين وإنشاء حركتي صرف واستلام." api="/api/warehouses/transfers" fields={['company_id','branch_id','source_warehouse_id','destination_warehouse_id','item_id','quantity','unit_cost','transfer_no']}  /></AppShell>;
}
