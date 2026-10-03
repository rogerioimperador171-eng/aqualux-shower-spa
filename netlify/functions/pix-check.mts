import { flevoFetch, friendlyMessage, json, PayError, pick, readJson } from "../lib/flevopay.mts";

const PAID = new Set(["PAID", "APPROVED", "COMPLETED", "COMPLETO", "PAGO", "CONFIRMED"]);
const FAILED = new Set(["EXPIRED", "EXPIRADO", "CANCELED", "CANCELLED", "CANCELADO", "REFUSED", "RECUSADO", "FAILED", "REJECTED", "REFUNDED", "ESTORNADO"]);

export default async (req: Request) => {
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
};
