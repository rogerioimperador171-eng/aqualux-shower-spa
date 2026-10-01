// Cliente da API ProPix BR. Roda apenas no servidor (Netlify Functions):
// as credenciais vêm das variáveis de ambiente e nunca chegam ao navegador.

const BASE_URL = process.env["PROPAY_BASE_URL"] || "https://api.propixbr.com";

export const UNIT_PRICE = 65.67;
export const SHIPPING_PRICES = { free: 0, sedex: 21.88 } as const;
export type ShippingId = keyof typeof SHIPPING_PRICES;

export class PropixError extends Error {
  constructor(public readonly kind: "config" | "timeout" | "api" | "network", public readonly status = 502) {
    super(kind);
  }
}

function credentials() {
  const id = process.env["PROPAY_CLIENT_ID"];
  const secret = process.env["PROPAY_CLIENT_SECRET"];
  if (!id || !secret) throw new PropixError("config", 503);
  return { "x-client-id": id, "x-client-secret": secret, "Content-Type": "application/json" };
}

export async function propixPost(path: string, body: unknown, timeoutMs: number) {
  const headers = credentials();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers, body: JSON.stringify(body), signal: controller.signal });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try { json = JSON.parse(text); } catch { /* resposta não-JSON */ }
    if (!res.ok) {
      console.error("ProPix error", path, res.status, text.slice(0, 500));
      throw new PropixError("api");
    }
    const data = json["data"];
    return (data && typeof data === "object" ? data : json) as Record<string, unknown>;
  } catch (err) {
    if (err instanceof PropixError) throw err;
    if (err instanceof Error && err.name === "AbortError") throw new PropixError("timeout", 504);
    console.error("ProPix network error", path, err);
    throw new PropixError("network");
  } finally {
    clearTimeout(timer);
  }
}

export const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

export function friendlyMessage(err: unknown) {
  const kind = err instanceof PropixError ? err.kind : "api";
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
