import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function SettingsPage() {
  return <AppShell><ResourceScreen title="إعدادات النظام" description="إعدادات عامة للشركة، النسخ الاحتياطي، التكاملات، وسياسات التشغيل." api="/api/system/settings" fields={["company_id", "key", "value", "name_ar"]} /></AppShell>;
}
