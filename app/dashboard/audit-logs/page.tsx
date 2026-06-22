import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="عارض سجل التدقيق" description="عرض سجل النشاط لكل العمليات الحساسة حسب الشركة والفرع." api="/api/erp/activity_logs" fields={['company_id', 'branch_id', 'action', 'actor_id']} /></AppShell>;
}
