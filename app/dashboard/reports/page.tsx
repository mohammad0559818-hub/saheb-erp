import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="التقارير المتقدمة" description="تصدير ميزان المراجعة والدخل والمركز المالي والتدفقات النقدية PDF/Excel/CSV." api="/api/accounting/reports" fields={['company_id', 'type', 'format', 'date_from', 'date_to']} method="GET" /></AppShell>;
}
