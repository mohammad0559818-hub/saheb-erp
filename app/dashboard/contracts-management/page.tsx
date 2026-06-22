import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="إدارة العقود" description="إنشاء العقود وربطها بالمشاريع والعملاء والموردين والمرفقات." api="/api/contracts" fields={['company_id', 'contract_no', 'name_ar', 'contract_value', 'starts_on', 'ends_on']} /></AppShell>;
}
