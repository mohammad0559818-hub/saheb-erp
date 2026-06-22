import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="النسخ الاحتياطي والاستعادة" description="تصدير نسخة JSON كاملة للشركة أو استعادة نسخة JSON بعد التحقق وتسجيل العملية في سجل النسخ الاحتياطي." api="/api/system/backup-restore" fields={['company_id','file_name','tables']} actions={[{ label: 'تصدير JSON', href: '/api/system/backup-export?company_id=' }, { label: 'خطة النسخ', href: '/api/system/backup-plan' }]} /></AppShell>;
}
