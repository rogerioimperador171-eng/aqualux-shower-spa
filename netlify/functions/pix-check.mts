import { friendlyMessage, json, PropixError, propixPost, readJson, str } from "../lib/propix.mts";

export default async (req: Request) => {
  if (req.method !== "POST") return json({ ok: false, error: "Método não permitido." }, 405);

  const body = await readJson(req);
  const transactionId = typeof body?.["transactionId"] === "string" ? body["transactionId"].trim() : "";
  if (!transactionId || transactionId.length > 200) return json({ ok: false, error: "Transação inválida." }, 400);

  try {
    const r = await propixPost("/api/v1/check", { transactionId }, 10000);
    return json({ ok: true, state: str(r["transactionState"] ?? r["status"]).toUpperCase() });
  } catch (err) {
    return json({ ok: false, error: friendlyMessage(err) }, err instanceof PropixError ? err.status : 502);
  }
};
