import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="إدارة الخزنة الرئيسية" description="إدارة الخزنة الرئيسية للشركة وحركات التغذية والتوريد." api="/api/treasury/main-vault" fields={['company_id','branch_id','name_ar','currency','balance']}  /></AppShell>;
}
