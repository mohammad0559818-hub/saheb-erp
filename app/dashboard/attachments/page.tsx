import { AppShell } from "@/components/app-shell";
import { AttachmentUploader } from "@/components/attachment-uploader";
import { ResourceScreen } from "@/components/resource-screen";

export default function AttachmentManagementPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-bold text-blue-700">/api/attachments/upload + /api/attachments/link</p>
          <h1 className="mt-2 text-4xl font-black">إدارة المرفقات العامة</h1>
          <p className="mt-3 leading-8 text-slate-600">رفع آمن عبر Supabase Storage ثم ربط المرفق بأي سجل في النظام: عقود، فواتير، مندوبين، عملاء، موردين أو مشاريع.</p>
        </section>
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <AttachmentUploader />
          <ResourceScreen title="٢) ربط مرفق بسجل" description="بعد رفع الملف باستخدام الرابط الموقّع، اربط attachment_id بالسجل التشغيلي المطلوب." api="/api/attachments/link" fields={["company_id","branch_id","attachment_id","subject_table","subject_id","name_ar","metadata"]} />
        </section>
      </main>
    </AppShell>
  );
}
