import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE_URL = "https://api.propixbr.com";

type PixResult =
  | { ok: true; transactionId: string; copyPaste: string; qrcodeUrl: string; status: string }
  | { ok: false; error: string };

type CheckResult = { ok: true; state: string } | { ok: false; error: string };

function credentials() {
  const id = process.env["PROPAY_CLIENT_ID"];
  const secret = process.env["PROPAY_CLIENT_SECRET"];
  if (!id || !secret) return null;
  return { "x-client-id": id, "x-client-secret": secret, "Content-Type": "application/json" };
}

async function call(path: string, body: unknown, timeoutMs = 15000) {
  const headers = credentials();
  if (!headers) throw new Error("config");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers, body: JSON.stringify(body), signal: controller.signal });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try { json = JSON.parse(text); } catch { /* resposta não-JSON */ }
    if (!res.ok) {
      console.error("ProPix error", res.status, text.slice(0, 500));
      throw new Error("api");
    }
    return (json["data"] && typeof json["data"] === "object" ? json["data"] : json) as Record<string, unknown>;
  } finally {
    clearTimeout(timer);
  }
}

function message(err: unknown) {
  if (err instanceof Error && err.name === "AbortError") return "O servidor de pagamento demorou para responder. Tente novamente.";
  if (err instanceof Error && err.message === "config") return "Pagamento temporariamente indisponível. Tente novamente em instantes.";
  return "Não foi possível gerar o PIX agora. Tente novamente.";
}

const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

export const createPix = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      quantity: z.number().int().min(1).max(20),
      payerName: z.string().trim().min(3).max(120),
      payerDocument: z.string().regex(/^\d{11}$|^\d{14}$/),
    }).parse(d),
  )
  .handler(async ({ data }): Promise<PixResult> => {
    const amount = Math.round(data.quantity * 65.67 * 100) / 100;
    try {
      const r = await call("/api/v1/deposit", {
        amount,
        description: `AquaLux Showers - Chuveiro Luxo 60cm (${data.quantity}x)`,
        payerName: data.payerName,
        payerDocument: data.payerDocument,
      });
      const transactionId = str(r["transactionId"] ?? r["transaction_id"] ?? r["id"]);
      const copyPaste = str(r["copyPaste"] ?? r["copy_paste"] ?? r["pixCopiaECola"]);
      const qrcodeUrl = str(r["qrcodeUrl"] ?? r["qrCodeUrl"] ?? r["qrcode"]);
      if (!transactionId || !copyPaste) return { ok: false, error: "Não foi possível gerar o PIX agora. Tente novamente." };
      return { ok: true, transactionId, copyPaste, qrcodeUrl, status: str(r["status"]) || "PENDENTE" };
    } catch (err) {
      return { ok: false, error: message(err) };
    }
  });

export const checkPix = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ transactionId: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }): Promise<CheckResult> => {
    try {
      const r = await call("/api/v1/check", { transactionId: data.transactionId }, 10000);
      return { ok: true, state: str(r["transactionState"] ?? r["status"]).toUpperCase() };
    } catch (err) {
      return { ok: false, error: message(err) };
    }
  });
