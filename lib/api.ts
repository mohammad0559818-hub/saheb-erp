export const statuses = ["draft", "active", "inactive", "approved", "rejected"] as const;
type Status = (typeof statuses)[number];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseListQuery(input: Record<string, string>) {
  const limit = Math.min(Math.max(Number(input.limit ?? 25), 1), 100);
  const offset = Math.max(Number(input.offset ?? 0), 0);
  return {
    company_id: validateOptionalUuid(input.company_id, "company_id"),
    branch_id: validateOptionalUuid(input.branch_id, "branch_id"),
    warehouse_id: validateOptionalUuid(input.warehouse_id, "warehouse_id"),
    search: input.search?.trim() || undefined,
    status: statuses.includes(input.status as Status) ? input.status : undefined,
    limit,
    offset,
  };
}

export function parseGenericRecord(input: Record<string, unknown>): Record<string, unknown> & { company_id: string; name_ar: string; branch_id?: string } {
  if (!isUuid(input.company_id)) throw new Error("company_id يجب أن يكون UUID صحيح");
  if (typeof input.name_ar !== "string" || input.name_ar.trim().length < 2) throw new Error("name_ar مطلوب");
  return { status: "active", metadata: {}, ...input, company_id: input.company_id, name_ar: input.name_ar.trim() } as Record<string, unknown> & { company_id: string; name_ar: string; branch_id?: string };
}

export function parseUpdateRecord(input: Record<string, unknown>) {
  if (!isUuid(input.id)) throw new Error("id يجب أن يكون UUID صحيح");
  return input;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function validateOptionalUuid(value: string | undefined, field: string) {
  if (!value) return undefined;
  if (!uuidPattern.test(value)) throw new Error(`${field} يجب أن يكون UUID صحيح`);
  return value;
}
