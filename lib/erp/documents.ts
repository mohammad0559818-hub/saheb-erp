export type DocumentLine = { item_id?: string; description?: string; quantity: number; unit_price?: number; unit_cost?: number; vat_rate?: number };

export function calculateLines(lines: DocumentLine[], priceKey: "unit_price" | "unit_cost") {
  if (!Array.isArray(lines) || lines.length === 0) throw new Error("يجب إدخال بند واحد على الأقل");
  let subtotal = 0;
  let vat_total = 0;
  const normalized = lines.map((line) => {
    const quantity = Number(line.quantity);
    const unit = Number(line[priceKey] ?? 0);
    const vatRate = Number(line.vat_rate ?? 15);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("كمية البند يجب أن تكون أكبر من صفر");
    if (!Number.isFinite(unit) || unit < 0) throw new Error("سعر/تكلفة البند غير صحيحة");
    const net = round(quantity * unit);
    const vat = round(net * vatRate / 100);
    subtotal += net;
    vat_total += vat;
    return { ...line, quantity, [priceKey]: unit, vat_rate: vatRate, line_total: round(net + vat) };
  });
  return { lines: normalized, subtotal: round(subtotal), vat_total: round(vat_total), total: round(subtotal + vat_total) };
}

export function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
