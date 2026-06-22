import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="لوحة ثروة المالك" description="تحليل الأصول والنقد والبنوك والاستثمارات والمشاريع وصافي الثروة." api="/api/wealth/summary" fields={['company_id']} method="GET" /></AppShell>;
}
