import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="مكتب شحن دبي" description="إدارة الشحنات والتخليص وتخصيص التكلفة على فواتير المشتريات." api="/api/dubai-shipping/shipments" fields={['company_id', 'awb', 'carrier', 'eta', 'clearance_cost']} /></AppShell>;
}
