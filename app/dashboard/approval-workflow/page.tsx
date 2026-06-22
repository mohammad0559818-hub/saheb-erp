import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="سير الموافقات" description="إنشاء طلبات موافقة متعددة الخطوات واعتمادها أو رفضها." api="/api/approvals/engine" fields={['company_id', 'subject_table', 'subject_id', 'approver_id', 'decision']} /></AppShell>;
}
