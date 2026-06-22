type Filter = { column: string; value: unknown; op?: "eq" | "in" | "ilike" };
type QueryOptions = { count?: "exact" };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv(value: string | undefined, name: string) {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

class PostgrestBuilder {
  private filters: Filter[] = [];
  private selected = "*";
  private countExact = false;
  private orderBy?: { column: string; ascending: boolean };
  private rangeValue?: [number, number];
  private mutation?: { method: "POST" | "PATCH" | "DELETE"; body?: unknown };

  constructor(private table: string, private key: string, private baseUrl: string) {}

  select(columns = "*", options?: QueryOptions) { this.selected = columns; this.countExact = options?.count === "exact"; return this; }
  eq(column: string, value: unknown) { this.filters.push({ column, value, op: "eq" }); return this; }
  in(column: string, value: unknown[]) { this.filters.push({ column, value, op: "in" }); return this; }
  ilike(column: string, value: string) { this.filters.push({ column, value, op: "ilike" }); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orderBy = { column, ascending: options?.ascending ?? true }; return this; }
  range(from: number, to: number) { this.rangeValue = [from, to]; return this; }
  insert(body: unknown) { this.mutation = { method: "POST", body }; return this; }
  update(body: unknown) { this.mutation = { method: "PATCH", body }; return this; }
  delete() { this.mutation = { method: "DELETE" }; return this; }

  async single() { const result = await this.execute(); return { ...result, data: Array.isArray(result.data) ? result.data[0] : result.data }; }
  async maybeSingle() { return this.single(); }
  then<TResult1 = any, TResult2 = never>(resolve?: (value: any) => TResult1 | PromiseLike<TResult1>, reject?: (reason: any) => TResult2 | PromiseLike<TResult2>) { return this.execute().then(resolve, reject); }

  private async execute() {
    const endpoint = new URL(`${this.baseUrl}/rest/v1/${this.table}`);
    endpoint.searchParams.set("select", this.selected);
    for (const filter of this.filters) {
      const value = filter.op === "in" ? `in.(${(filter.value as unknown[]).join(",")})` : filter.op === "ilike" ? `ilike.${filter.value}` : `eq.${filter.value}`;
      endpoint.searchParams.set(filter.column, value);
    }
    if (this.orderBy) endpoint.searchParams.set("order", `${this.orderBy.column}.${this.orderBy.ascending ? "asc" : "desc"}`);
    const headers: Record<string, string> = { apikey: this.key, authorization: `Bearer ${this.key}`, "content-type": "application/json", prefer: "return=representation" };
    if (this.countExact) headers.prefer += ",count=exact";
    if (this.rangeValue) headers.range = `${this.rangeValue[0]}-${this.rangeValue[1]}`;
    const response = await fetch(endpoint, { method: this.mutation?.method ?? "GET", headers, body: this.mutation?.body ? JSON.stringify(this.mutation.body) : undefined, cache: "no-store" });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) return { data: null, error: { message: data?.message ?? response.statusText }, count: null };
    return { data, error: null, count: response.headers.get("content-range")?.split("/")[1] ? Number(response.headers.get("content-range")?.split("/")[1]) : null };
  }
}

function createRestClient(key: string) {
  const baseUrl = requireEnv(url, "NEXT_PUBLIC_SUPABASE_URL");
  return {
    from: (table: string) => new PostgrestBuilder(table, key, baseUrl),
    storage: { from: (bucket: string) => ({ createSignedUploadUrl: async (path: string) => {
      const response = await fetch(`${baseUrl}/storage/v1/object/upload/sign/${bucket}/${path}`, { method: "POST", headers: { apikey: key, authorization: `Bearer ${key}` } });
      const data = await response.json();
      return response.ok ? { data, error: null } : { data: null, error: { message: data?.message ?? response.statusText } };
    } }) },
    auth: { signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key, "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      return response.ok ? { data, error: null } : { data: null, error: { message: data?.msg ?? data?.message ?? "فشل تسجيل الدخول" } };
    } },
  };
}

export function createSupabaseBrowserClient() {
  return createRestClient(requireEnv(anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function createSupabaseServiceClient() {
  return createRestClient(requireEnv(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY"));
}
