import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="إدارة الصناديق" description="إنشاء وإدارة الصناديق النقدية وربطها بالتحصيلات والتحويلات." api="/api/treasury/cashboxes" fields={['company_id','branch_id','name_ar','currency','balance']}  /></AppShell>;
}
