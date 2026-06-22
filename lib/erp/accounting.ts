export type JournalLineInput = { account_id: string; debit?: number; credit?: number; description?: string };
export type TrialBalanceLine = { code: string; name_ar: string; debit: number; credit: number; balance: number };

export function assertBalancedJournal(lines: JournalLineInput[]) {
  const debit = lines.reduce((sum, line) => sum + Number(line.debit ?? 0), 0);
  const credit = lines.reduce((sum, line) => sum + Number(line.credit ?? 0), 0);
  if (!lines.length) throw new Error("يجب إضافة سطور للقيد");
  if (Math.round((debit - credit) * 100) !== 0) throw new Error("القيد غير متوازن: إجمالي المدين لا يساوي إجمالي الدائن");
  return { debit, credit };
}

export function buildTrialBalance(lines: Array<{ account_code: string; account_name_ar: string; debit: number; credit: number }>): TrialBalanceLine[] {
  const map = new Map<string, TrialBalanceLine>();
  for (const line of lines) {
    const current = map.get(line.account_code) ?? { code: line.account_code, name_ar: line.account_name_ar, debit: 0, credit: 0, balance: 0 };
    current.debit += Number(line.debit ?? 0);
    current.credit += Number(line.credit ?? 0);
    current.balance = current.debit - current.credit;
    map.set(line.account_code, current);
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export function classifyFinancialStatement(accountType: string, balance: number) {
  if (["revenue", "income"].includes(accountType)) return { statement: "income", amount: -balance };
  if (["expense", "cost_of_sales"].includes(accountType)) return { statement: "income", amount: balance };
  if (["asset", "liability", "equity"].includes(accountType)) return { statement: "balance", amount: balance };
  return { statement: "other", amount: balance };
}
