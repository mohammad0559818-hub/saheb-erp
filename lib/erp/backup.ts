import { erpModules } from "@/lib/modules";

export const backupTables = Array.from(new Set([
  "companies", "company_memberships", "company_vat_numbers", "branches", "warehouses",
  ...erpModules.map((module) => module.table),
  "inventory_movements", "stock_valuation_layers", "sales_invoice_lines", "purchase_invoice_lines",
  "sales_quotations", "sales_quotation_lines", "sales_returns", "sales_return_lines", "purchase_returns", "purchase_return_lines",
  "customer_collections", "supplier_payments", "treasury_transfers", "cash_movements", "approval_steps", "approval_decisions", "attachment_links",
  "backup_jobs", "import_jobs"
]));

export function parseDelimited(text: string) {
  const rows = text.trim().split(/\r?\n/).filter(Boolean).map((line) => line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));
  const [headers, ...values] = rows;
  if (!headers?.length) throw new Error("ملف الاستيراد فارغ");
  return values.map((row) => Object.fromEntries(headers.map((header, index) => [header, coerce(row[index])]))) as Record<string, unknown>[];
}

function coerce(value?: string) {
  if (value === undefined || value === "") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value === "true" || value === "false") return value === "true";
  return value;
}
