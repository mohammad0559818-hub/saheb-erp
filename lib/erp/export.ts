export function toCsv(rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] ?? { message: "لا توجد بيانات" });
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

export function toExcelXml(rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] ?? { message: "لا توجد بيانات" });
  const cells = (values: unknown[]) => values.map((value) => `<Cell><Data ss:Type="String">${String(value ?? "")}</Data></Cell>`).join("");
  return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="SAHEB"><Table><Row>${cells(headers)}</Row>${rows.map((row) => `<Row>${cells(headers.map((header) => row[header]))}</Row>`).join("")}</Table></Worksheet></Workbook>`;
}

export function toPrintableHtml(title: string, rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] ?? { message: "لا توجد بيانات" });
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}th{background:#eff6ff}</style></head><body><h1>${title}</h1><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
}

export function toSimplePdf(title: string, rows: Record<string, unknown>[]) {
  const text = [title, ...rows.slice(0, 30).map((row) => Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(" | "))].join("\\n").replace(/[()]/g, "");
  const stream = `BT /F1 10 Tf 40 780 Td (${text}) Tj ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  const body = objects.join("\n");
  return `%PDF-1.4\n${body}\ntrailer << /Root 1 0 R >>\n%%EOF`;
}
