// As fotos do produto são ponteiros do Lovable Assets (src/assets/*.asset.json) com URLs
// /__l5e/assets-v1/... que só existem na hospedagem do Lovable. Na Netlify, este proxy
// busca a imagem original e a entrega com cache, sem armazenar binários no repositório.
const ORIGIN = Netlify.env.get("LOVABLE_ASSETS_ORIGIN") || "https://aqualux-shower-spa.lovable.app";

export default async (req: Request) => {
  const { pathname } = new URL(req.url);
  try {
    const upstream = await fetch(`${ORIGIN}${pathname}`, { headers: { accept: req.headers.get("accept") || "*/*" } });
    if (!upstream.ok) return new Response("Not found", { status: upstream.status === 404 ? 404 : 502 });
    const headers = new Headers();
    headers.set("content-type", upstream.headers.get("content-type") || "application/octet-stream");
    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("netlify-cdn-cache-control", "public, max-age=31536000, immutable");
    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return new Response("Bad gateway", { status: 502 });
  }
};

export const config = { path: "/__l5e/assets-v1/*", cache: "manual" };
