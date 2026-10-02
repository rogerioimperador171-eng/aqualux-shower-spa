// Cliente da API FlevoPay. Roda apenas no servidor (Netlify Functions):
// a API Key e a URL de upsell vêm das variáveis de ambiente e nunca chegam ao navegador.

export const BASE_URL = "https://app.flevopay.com.br/api/v1";

export const UNIT_PRICE = 65.67;
export const SHIPPING_PRICES = { free: 0, sedex: 21.88 } as const;
export type ShippingId = keyof typeof SHIPPING_PRICES;

export class PayError extends Error {
  constructor(public readonly kind: "config" | "timeout" | "api" | "network", public readonly status = 502) {
    super(kind);
  }
}

export function apiKey() {
  const key = process.env["FLEVOPAY_API_KEY"];
  if (!key) throw new PayError("config", 503);
  return key;
}

export async function flevoFetch(path: string, init: { method: "GET" | "POST"; body?: unknown }, timeoutMs: number) {
  const headers = { "Content-Type": "application/json", "X-API-Key": apiKey() };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: controller.signal,
    });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try { json = JSON.parse(text); } catch { /* resposta não-JSON */ }
    if (!res.ok) {
      console.error("FlevoPay error", path, res.status, text.slice(0, 500));
      throw new PayError("api");
    }
    const data = json["data"];
    return { ...json, ...(data && typeof data === "object" ? (data as Record<string, unknown>) : {}) } as Record<string, unknown>;
  } catch (err) {
    if (err instanceof PayError) throw err;
    if (err instanceof Error && err.name === "AbortError") throw new PayError("timeout", 504);
    console.error("FlevoPay network error", path, err);
    throw new PayError("network");
  } finally {
    clearTimeout(timer);
  }
}

export const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

/** Primeiro valor de texto encontrado, inclusive em objetos aninhados (ex.: pix.qrcode). */
export function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = str(obj[k]);
    if (v) return v;
  }
  for (const nested of ["pix", "payment", "transaction"]) {
    const n = obj[nested];
    if (n && typeof n === "object") {
      const v = pick(n as Record<string, unknown>, keys);
      if (v) return v;
    }
  }
  return "";
}

export function friendlyMessage(err: unknown) {
  const kind = err instanceof PayError ? err.kind : "api";
  if (kind === "timeout") return "O servidor de pagamento demorou para responder. Tente novamente.";
  if (kind === "config") return "Pagamento temporariamente indisponível. Tente novamente em instantes.";
  return "Não foi possível gerar o PIX agora. Tente novamente.";
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
