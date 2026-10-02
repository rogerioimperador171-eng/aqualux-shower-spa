import { flevoFetch, friendlyMessage, json, PayError, pick, readJson, SHIPPING_PRICES, UNIT_PRICE, type ShippingId } from "../lib/flevopay.mts";

const onlyDigits = (v: unknown) => (typeof v === "string" ? v.replace(/\D/g, "") : "");

function toQrSrc(raw: string) {
  if (!raw) return "";
  if (/^(https?:|data:)/.test(raw)) return raw;
  if (/^[A-Za-z0-9+/=\s]+$/.test(raw) && raw.length > 100) return `data:image/png;base64,${raw.replace(/\s/g, "")}`;
  return "";
}

export default async (req: Request) => {
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

  const productHash = process.env["FLEVOPAY_PRODUCT_HASH"];
  if (!productHash) return json({ ok: false, error: friendlyMessage(new PayError("config")) }, 503);

  // Valor calculado no servidor, em centavos.
  const amount = Math.round((quantity * UNIT_PRICE + SHIPPING_PRICES[shipping]) * 100);

  try {
    const r = await flevoFetch("/transaction", {
      method: "POST",
      body: { amount, productHash, customer: { name, email, document, phone } },
    }, 15000);
    const transactionId = pick(r, ["hash", "external_id", "externalId", "transactionHash", "transaction_id", "transactionId", "id"]);
    const copyPaste = pick(r, ["pix_code", "pixCode", "qr_code", "qrCode", "copyPaste", "copy_paste", "pixCopiaECola", "emv", "brcode", "qrcode"]);
    const qrcodeUrl = toQrSrc(pick(r, ["qr_code_image", "qrCodeImage", "qrcode_image", "qr_code_base64", "qrCodeBase64", "qrcodeUrl", "qrCodeUrl"]));
    if (!transactionId || !copyPaste) {
      console.error("FlevoPay transaction: resposta sem hash/código PIX", Object.keys(r));
      return json({ ok: false, error: "Não foi possível gerar o PIX agora. Tente novamente." }, 502);
    }
    return json({ ok: true, transactionId, copyPaste, qrcodeUrl, amount: amount / 100 });
  } catch (err) {
    return json({ ok: false, error: friendlyMessage(err), timeout: err instanceof PayError && err.kind === "timeout" }, err instanceof PayError ? err.status : 502);
  }
};
