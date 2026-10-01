import { friendlyMessage, json, PropixError, propixPost, readJson, SHIPPING_PRICES, str, UNIT_PRICE, type ShippingId } from "../lib/propix.mts";

const onlyDigits = (v: unknown) => (typeof v === "string" ? v.replace(/\D/g, "") : "");

function toQrSrc(raw: string) {
  if (!raw) return "";
  if (/^(https?:|data:)/.test(raw)) return raw;
  // Algumas respostas trazem o PNG em base64 puro.
  if (/^[A-Za-z0-9+/=\s]+$/.test(raw) && raw.length > 100) return `data:image/png;base64,${raw.replace(/\s/g, "")}`;
  return "";
}

export default async (req: Request) => {
  if (req.method !== "POST") return json({ ok: false, error: "Método não permitido." }, 405);

  const body = await readJson(req);
  const quantity = Number(body?.["quantity"]);
  const payerName = typeof body?.["payerName"] === "string" ? body["payerName"].trim().slice(0, 120) : "";
  const payerDocument = onlyDigits(body?.["payerDocument"]);
  const shipping = (body?.["shipping"] === "sedex" ? "sedex" : "free") as ShippingId;

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20 || payerName.length < 3 || !/^(\d{11}|\d{14})$/.test(payerDocument)) {
    return json({ ok: false, error: "Dados do pedido inválidos. Revise suas informações e tente novamente." }, 400);
  }

  // O valor é sempre calculado no servidor para não depender do navegador.
  const amount = Math.round((quantity * UNIT_PRICE + SHIPPING_PRICES[shipping]) * 100) / 100;

  try {
    const r = await propixPost("/api/v1/deposit", {
      amount,
      description: `AquaLux Showers - Chuveiro Luxo 60cm (${quantity}x)`,
      payerName,
      payerDocument,
    }, 15000);
    const transactionId = str(r["transactionId"] ?? r["transaction_id"] ?? r["id"]);
    const copyPaste = str(r["copyPaste"] ?? r["copy_paste"] ?? r["pixCopiaECola"] ?? r["qrcode"]);
    const qrcodeUrl = toQrSrc(str(r["qrcodeUrl"] ?? r["qrCodeUrl"] ?? r["qrcode_url"] ?? r["qrCodeBase64"]));
    if (!transactionId || !copyPaste) {
      console.error("ProPix deposit: resposta sem transactionId/copyPaste", Object.keys(r));
      return json({ ok: false, error: "Não foi possível gerar o PIX agora. Tente novamente." }, 502);
    }
    return json({ ok: true, transactionId, copyPaste, qrcodeUrl, amount, status: str(r["status"]) || "PENDENTE" });
  } catch (err) {
    return json({ ok: false, error: friendlyMessage(err), timeout: err instanceof PropixError && err.kind === "timeout" }, err instanceof PropixError ? err.status : 502);
  }
};
