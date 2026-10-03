// Integração PIX FlevoPay. Roda só no servidor (rota /api/pix/* no Lovable e Netlify Functions na Netlify):
// a API Key e a URL de upsell vêm das variáveis de ambiente e nunca chegam ao navegador.

const BASE_URL = "https://app.flevopay.com.br/api/v1";
export const UNIT_PRICE = 65.67;
export const SHIPPING_PRICES = { free: 0, sedex: 21.88 } as const;
type ShippingId = keyof typeof SHIPPING_PRICES;
type Kind = "config" | "timeout" | "api" | "network";

class PayError extends Error {
  kind: Kind;
  status: number;
  constructor(kind: Kind, status = 502) {
    super(kind);
    this.kind = kind;
    this.status = status;
  }
}

async function flevoFetch(path: string, init: { method: "GET" | "POST"; body?: unknown }, timeoutMs: number) {
  const key = process.env["FLEVOPAY_API_KEY"];
  if (!key) throw new PayError("config", 503);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: init.method,
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-API-Key": key },
      body: init.body === undefined ? null : JSON.stringify(init.body),
      signal: controller.signal,
    });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try { json = JSON.parse(text); } catch { /* resposta não-JSON */ }
    if (!res.ok || json["success"] === false) {
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

const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

/** Primeiro valor de texto encontrado, inclusive em objetos aninhados (ex.: pix.qr_code). */
function pick(obj: Record<string, unknown>, keys: string[]): string {
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

function friendlyMessage(err: unknown) {
  const kind = err instanceof PayError ? err.kind : "api";
  if (kind === "timeout") return "O servidor de pagamento demorou para responder. Tente novamente.";
  if (kind === "config") return "Pagamento temporariamente indisponível. Tente novamente em instantes.";
  return "Não foi possível gerar o PIX agora. Tente novamente.";
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const onlyDigits = (v: unknown) => (typeof v === "string" ? v.replace(/\D/g, "") : "");

function toQrSrc(raw: string) {
  if (!raw) return "";
  if (/^(https?:|data:)/.test(raw)) return raw;
  if (/^[A-Za-z0-9+/=\s]+$/.test(raw) && raw.length > 100) return `data:image/png;base64,${raw.replace(/\s/g, "")}`;
  return "";
}

export async function handlePixCreate(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ ok: false, error: "Método não permitido." }, 405);

  const body = await readJson(req);
  const quantity = Number(body?.["quantity"]);
  const name = typeof body?.["payerName"] === "string" ? body["payerName"].trim().slice(0, 120) : "";
  const email = typeof body?.["payerEmail"] === "string" ? body["payerEmail"].trim().slice(0, 160) : "";
  const document = onlyDigits(body?.["payerDocument"]);
  const phone = onlyDigits(body?.["payerPhone"]).slice(0, 13);
  const shipping = (body?.["shipping"] === "sedex" ? "sedex" : "free") as ShippingId;

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20 || name.length < 3 || !/^\S+@\S+\.\S+$/.test(email) || !/^(\d{11}|\d{14})$/.test(document) || phone.length < 10) {
    return json({ ok: false, error: "Dados do pedido inválidos. Revise suas informações e tente novamente." }, 400);
  }

  // Valor calculado no servidor, em centavos (preço × quantidade + frete).
  const amount = Math.round(quantity * UNIT_PRICE * 100) + Math.round(SHIPPING_PRICES[shipping] * 100);
  const reference = `AQUALUX-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  try {
    const r = await flevoFetch("/transaction", {
      method: "POST",
      body: {
        amount,
        description: `Pedido AquaLux - Chuveiro Luxo a Gás x${quantity}`,
        reference,
        source: "api_externa",
        customer: { name, email, document, phone },
      },
    }, 15000);
    const transactionId = pick(r, ["transaction_id", "transactionId", "hash", "id", "external_id"]);
    const copyPaste = pick(r, ["qr_code", "qrCode", "pix_code", "pixCode", "copyPaste", "copy_paste", "emv", "brcode"]);
    const qrcodeUrl = toQrSrc(pick(r, ["qr_code_base64", "qrCodeBase64", "qr_code_image", "qrCodeImage", "qrcodeUrl"]));
    if (!transactionId || !copyPaste) {
      console.error("FlevoPay transaction: resposta sem transaction_id/qr_code", Object.keys(r));
      return json({ ok: false, error: "Não foi possível gerar o PIX agora. Tente novamente." }, 502);
    }
    return json({ ok: true, transactionId, copyPaste, qrcodeUrl, amount: amount / 100, reference });
  } catch (err) {
    return json({ ok: false, error: friendlyMessage(err), timeout: err instanceof PayError && err.kind === "timeout" }, err instanceof PayError ? err.status : 502);
  }
}

const PAID = new Set(["PAID", "APPROVED", "COMPLETED", "COMPLETO", "PAGO", "CONFIRMED"]);
const FAILED = new Set(["EXPIRED", "EXPIRADO", "CANCELED", "CANCELLED", "CANCELADO", "REFUSED", "RECUSADO", "FAILED", "REJECTED", "REFUNDED", "ESTORNADO"]);

export async function handlePixCheck(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ ok: false, error: "Método não permitido." }, 405);

  const body = await readJson(req);
  const transactionId = typeof body?.["transactionId"] === "string" ? body["transactionId"].trim() : "";
  if (!transactionId || transactionId.length > 200) return json({ ok: false, error: "Transação inválida." }, 400);

  try {
    const r = await flevoFetch(`/check_status.php?hash=${encodeURIComponent(transactionId)}`, { method: "GET" }, 10000);
    const raw = pick(r, ["status", "payment_status", "paymentStatus", "transactionState", "state"]).toUpperCase();
    const paid = PAID.has(raw) || r["paid"] === true;
    if (!paid) return json({ ok: true, status: FAILED.has(raw) ? "failed" : "pending" });
    // A URL de upsell só é revelada depois do pagamento confirmado.
    const redirectUrl = process.env["FLEVOPAY_UPSELL_URL"] || "";
    return json({ ok: true, status: "paid", ...(redirectUrl ? { redirect_url: redirectUrl } : {}) });
  } catch (err) {
    return json({ ok: false, error: friendlyMessage(err) }, err instanceof PayError ? err.status : 502);
  }
}
