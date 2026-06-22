import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="المشاريع والاستثمارات" description="متابعة ميزانيات المشاريع والقيمة العادلة للاستثمارات." api="/api/erp/projects" fields={['company_id', 'name_ar', 'budget', 'status']} actions={[{ label: "الاستثمارات", href: "/dashboard/investments" }]} /></AppShell>;
}
