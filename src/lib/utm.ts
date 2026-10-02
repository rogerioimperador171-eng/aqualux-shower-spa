// Guarda os parâmetros de campanha (UTMs, fbclid etc.) da primeira página visitada
// para repassá-los à URL de upsell depois do pagamento, mesmo após navegar até o checkout.
const KEY = "aqualux_params";
const IGNORED = new Set(["qtd"]);

export function saveCampaignParams() {
  if (typeof window === "undefined") return;
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || "{}") as Record<string, string>;
    new URLSearchParams(window.location.search).forEach((v, k) => { if (!IGNORED.has(k)) saved[k] = v; });
    sessionStorage.setItem(KEY, JSON.stringify(saved));
  } catch { /* sessionStorage indisponível */ }
}

export function withCampaignParams(url: string) {
  const dest = new URL(url, window.location.href);
  const params: Record<string, string> = {};
  try { Object.assign(params, JSON.parse(sessionStorage.getItem(KEY) || "{}")); } catch { /* ignora */ }
  new URLSearchParams(window.location.search).forEach((v, k) => { if (!IGNORED.has(k)) params[k] = v; });
  for (const [k, v] of Object.entries(params)) if (!dest.searchParams.has(k)) dest.searchParams.set(k, v);
  return dest.toString();
}
