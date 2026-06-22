import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="مركز الإشعارات" description="متابعة الإشعارات والتسليمات والتصعيدات التشغيلية." api="/api/erp/notifications" fields={['company_id', 'recipient_id', 'name_ar', 'read_at']} /></AppShell>;
}
