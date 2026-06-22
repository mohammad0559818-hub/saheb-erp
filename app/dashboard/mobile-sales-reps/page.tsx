import { AppShell } from "@/components/app-shell";
import { AttachmentUploader } from "@/components/attachment-uploader";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><main className="mx-auto max-w-6xl px-6 py-10"><ResourceScreen title="مندوبو المبيعات الجوالة" description="إدارة المندوبين والتحصيلات وتسليم العهد للكاشير مع إمكانية رفع وربط صور الهوية والمستندات." api="/api/mobile-sales/representatives" fields={["company_id", "branch_id", "employee_id", "name_ar", "territory", "target_amount"]} actions={[{ label: "تسليم العهدة", href: "/api/mobile-sales/handover" }, { label: "كل المرفقات", href: "/dashboard/attachments" }]} /><div className="mt-6"><AttachmentUploader /></div><section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm"><h2 className="text-2xl font-black">ربط صور ومستندات المندوب</h2><p className="mt-3 leading-8 text-slate-600">بعد إنشاء المندوب، استخدم subject_table بقيمة <code>mobile_sales_representatives</code> و subject_id بمعرف المندوب لربط صورة الهوية أو التفويض أو أي مستند.</p></section></main></AppShell>;
}
