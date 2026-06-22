import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="قيود اليومية" description="ترحيل قيد يومية متوازن مع بنود مدينة ودائنة وربطه بالتدقيق والصلاحيات." api="/api/accounting/journals" fields={['company_id','branch_id','entry_no','entry_date','description','lines']}  /></AppShell>;
}
