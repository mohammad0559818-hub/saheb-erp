import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="نماذج VAT متعددة" description="إنشاء مستندات ضريبية متعددة البائع/العميل للسعودية والإمارات." api="/api/vat/documents" fields={['company_id','branch_id','document_type','seller_vat_number_id','customer_vat_number_id','document_no','issue_date','subtotal','vat_total','total']}  /></AppShell>;
}
