import { AppShell } from "@/components/app-shell";
import { ResourceScreen } from "@/components/resource-screen";

export default function Page() {
  return <AppShell><ResourceScreen title="لوحة تحليل فروقات AI" description="تحليل فروقات كشوف العملاء والموردين مع اقتراح السبب والإجراء." api="/api/ai/discrepancies" fields={['company_id', 'party_type', 'party_id', 'erp_balance', 'statement_balance']} /></AppShell>;
}
