import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="المستخدمون والصلاحيات" description="إدارة عضويات الشركات وصلاحيات الأدوار لكل Module و Action." api="/api/permissions/check" fields={['user_id', 'company_id', 'module_key', 'action']} method="GET" /></AppShell>;
}
