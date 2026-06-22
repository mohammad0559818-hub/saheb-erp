import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function CompanyProfilePage() {
  return <AppShell><ResourceScreen title="ملف الشركة وإعدادات VAT" description="إدارة بيانات الشركة وأرقام VAT المتعددة للبائعين والعملاء والموردين." api="/api/erp/multi_vat" fields={["company_id", "party_type", "party_id", "vat_number", "country"]} /></AppShell>;
}
