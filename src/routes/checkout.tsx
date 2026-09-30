import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ArrowRight, Check, ChevronUp, Copy, CreditCard, Lock, MapPin, ShieldCheck, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import photo0 from "@/assets/IMG_4660.jpeg.asset.json";
import { checkPix, createPix } from "@/lib/pix.functions";

const PRICE = 65.67;
const productName = "Chuveiro Luxo a Gás 60cm Banho Ducha Luxuosa e Chuveiro de mão 2 Saídas Instalação Padrão Hotel Ajustável";
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/checkout")({
  validateSearch: (s) => z.object({ qtd: z.coerce.number().int().min(1).max(20).catch(1) }).parse(s),
  head: () => ({ meta: [
    { title: "Checkout seguro | AquaLux Showers" },
    { name: "description", content: "Finalize a compra do seu chuveiro AquaLux Showers com pagamento seguro via PIX." },
    { property: "og:title", content: "Checkout seguro | AquaLux Showers" },
    { property: "og:description", content: "Pagamento 100% seguro via PIX e frete grátis." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Checkout,
});

const onlyDigits = (v: string) => v.replace(/\D/g, "");
const maskCpf = (v: string) => { const d = onlyDigits(v).slice(0, 11); return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"); };
const maskPhone = (v: string) => { const d = onlyDigits(v).slice(0, 11); return d.length <= 2 ? d.replace(/(\d{1,2})/, "($1") : d.length <= 7 ? d.replace(/(\d{2})(\d+)/, "($1) $2") : d.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3"); };
const maskCep = (v: string) => onlyDigits(v).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

function validCpf(raw: string) {
  const c = onlyDigits(raw);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const calc = (len: number) => { let s = 0; for (let i = 0; i < len; i++) s += Number(c[i]) * (len + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  return calc(9) === Number(c[9]) && calc(10) === Number(c[10]);
}

function Field({ label, error, ok, children }: { label: string; error?: string; ok?: boolean; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-foreground">{label}{!label.includes("opcional") && <span className="text-destructive"> *</span>}</span><div className="relative">{children}{ok && <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success" />}</div>{error && <span className="mt-1 block text-xs text-destructive">{error}</span>}</label>;
}
const inputCls = "h-12 w-full rounded-md border border-input bg-background px-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary disabled:bg-muted";

function Checkout() {
  const { qtd } = Route.useSearch();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(qtd);
  const [step, setStep] = useState(1);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [seconds, setSeconds] = useState(15 * 60);
  const [p, setP] = useState({ name: "", email: "", cpf: "", phone: "" });
  const [a, setA] = useState({ cep: "", street: "", number: "", noNumber: false, district: "", city: "", uf: "", complement: "" });
  const [cepState, setCepState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [addressSaved, setAddressSaved] = useState(false);
  const [shipping, setShipping] = useState<"free" | "sedex">("free");
  const [touched, setTouched] = useState(false);
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [pix, setPix] = useState<{ transactionId: string; copyPaste: string; qrcodeUrl: string } | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState("");
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const createPixFn = useServerFn(createPix);
  const checkPixFn = useServerFn(checkPix);
  const stepRef = useRef<HTMLDivElement>(null);

  const shippingCost = shipping === "sedex" ? 21.88 : 0;
  const subtotal = quantity * PRICE;
  const total = subtotal + (step >= 2 && addressSaved ? shippingCost : 0);

  useEffect(() => { const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { stepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step]);

  // Polling a cada 3s até transactionState === COMPLETO
  useEffect(() => {
    if (!pix || paid) return;
    let active = true;
    const t = setInterval(async () => {
      try {
        const r = await checkPixFn({ data: { transactionId: pix.transactionId } });
        if (active && r.ok && r.state === "COMPLETO") { setPaid(true); clearInterval(t); }
      } catch { /* tenta novamente no próximo ciclo */ }
    }, 3000);
    return () => { active = false; clearInterval(t); };
  }, [pix, paid, checkPixFn]);

  const pErr = {
    name: p.name.trim().split(/\s+/).length < 2 ? "Informe nome e sobrenome." : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim()) ? "" : "Informe um e-mail válido.",
    cpf: validCpf(p.cpf) ? "" : "Informe um CPF válido.",
    phone: onlyDigits(p.phone).length >= 10 ? "" : "Informe um celular válido.",
  };
  const pValid = !Object.values(pErr).some(Boolean);
  const aValid = cepState === "ok" && a.street.trim() && a.district.trim() && (a.noNumber || a.number.trim());

  async function lookupCep(cep: string) {
    const d = onlyDigits(cep);
    if (d.length !== 8) { setCepState("idle"); return; }
    setCepState("loading");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (j.erro) throw new Error();
      setA((x) => ({ ...x, street: j.logradouro || x.street, district: j.bairro || x.district, city: j.localidade, uf: j.uf }));
      setCepState("ok");
    } catch { setCepState("error"); }
  }

  async function generatePix() {
    setPixLoading(true); setPixError("");
    try {
      const r = await createPixFn({ data: { quantity, payerName: p.name.trim(), payerDocument: onlyDigits(p.cpf) } });
      if (r.ok) setPix({ transactionId: r.transactionId, copyPaste: r.copyPaste, qrcodeUrl: r.qrcodeUrl });
      else setPixError(r.error);
    } catch { setPixError("Falha de conexão. Verifique sua internet e tente novamente."); }
    finally { setPixLoading(false); }
  }

  async function copyPix() {
    if (!pix) return;
    try { await navigator.clipboard.writeText(pix.copyPaste); } catch {
      const el = document.createElement("textarea"); el.value = pix.copyPaste; document.body.appendChild(el); el.select(); document.execCommand("copy"); el.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0"), ss = String(seconds % 60).padStart(2, "0");
  const steps = [{ n: 1, label: "Informações pessoais", Icon: User }, { n: 2, label: "Entrega", Icon: Truck }, { n: 3, label: "Pagamento", Icon: CreditCard }];

  if (quantity === 0) return <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"><p className="text-sm">Seu carrinho está vazio.</p><Button onClick={() => navigate({ to: "/" })}>Voltar para a loja</Button></div>;

  return <div className="min-h-screen bg-muted/40 text-foreground">
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-[72px] max-w-xl items-center justify-between px-5">
        <Link to="/" className="brand-logo leading-none text-primary-foreground no-underline"><span className="block text-[24px]">AquaLux</span><span className="block text-[9px] font-sans font-semibold tracking-[0.42em] opacity-90">SHOWERS</span></Link>
        <div className="flex items-center gap-2"><Lock className="size-5" /><div className="text-[11px] font-bold leading-tight">PAGAMENTO<br /><span className="font-normal">100% SEGURO</span></div></div>
      </div>
      <div className="checkout-stripe h-1" />
    </header>

    <main className="mx-auto max-w-xl px-4 pb-10">
      <div className="pt-6 text-center">
        <h1 className="text-lg font-bold text-accent-foreground">Frete grátis apenas hoje!</h1>
        <p className="mt-1 text-sm text-accent-foreground">Você tem <span className="rounded bg-primary px-1.5 py-0.5 font-bold tabular-nums text-primary-foreground">00:{mm}:{ss}</span> para finalizar seu pedido</p>
      </div>

      <ol className="relative mt-7 grid grid-cols-3">
        <div className="absolute left-0 right-0 top-6 h-[3px] bg-border" />
        <div className="absolute left-0 top-6 h-[3px] bg-primary transition-all" style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }} />
        {steps.map(({ n, label, Icon }) => <li key={n} className="relative flex flex-col items-center text-center"><span className={`flex size-12 items-center justify-center rounded-xl border-2 ${step >= n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}><Icon className="size-5" /></span><span className="mt-1.5 max-w-[90px] text-[12px] font-bold leading-tight">{label}</span></li>)}
      </ol>

      <section className="mt-4 rounded-lg bg-card p-5 shadow-sm">
        <button type="button" onClick={() => setSummaryOpen((v) => !v)} className="flex w-full items-center justify-between text-sm font-medium tracking-wide">RESUMO<ChevronUp className={`size-5 transition-transform ${summaryOpen ? "" : "rotate-180"}`} /></button>
        {summaryOpen && <>
          <div className="mt-4 flex gap-4 border-b pb-4">
            <img src={photo0.url} alt="Chuveiro AquaLux" className="size-20 shrink-0 rounded border bg-muted object-cover" />
            <div className="min-w-0">
              <p className="text-sm leading-5">{productName}</p>
              <p className="mt-2 text-[13px] font-bold"><span className="mr-4">Qtd.: {quantity}</span>{money(subtotal)}</p>
              {!paid && <button type="button" onClick={() => setQuantity(0)} className="mt-2 text-[13px] text-muted-foreground underline">Remover produto</button>}
            </div>
          </div>
          <div className="mt-4 space-y-3 rounded-md bg-muted p-4 text-sm">
            <div className="flex justify-between font-medium"><span>Produto</span><span className="font-bold">{money(subtotal)}</span></div>
            {step >= 2 && addressSaved && <div className="flex justify-between font-medium"><span>Frete</span><span className="font-bold text-success">{shippingCost ? money(shippingCost) : "Frete Grátis"}</span></div>}
            <div className="flex items-center justify-between font-medium"><span>Total</span><span className="text-lg font-bold text-success">{money(total)}</span></div>
          </div>
        </>}
      </section>

      <div ref={stepRef} className="scroll-mt-4" />

      {step === 1 && <section className="mt-6 rounded-lg bg-card p-5 shadow-sm">
        <StepTitle n={1} title="Identificação" sub="Utilizaremos seu e-mail para: identificar seu perfil, histórico de compra, notificação de pedidos e carrinho de compras." />
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setTouched(true); if (pValid) { setStep(2); setTouched(false); } }}>
          <Field label="Nome completo" error={touched ? pErr.name : ""}><input className={inputCls} autoComplete="name" placeholder="Seu nome completo" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value.slice(0, 120) })} /></Field>
          <Field label="E-mail" error={touched ? pErr.email : ""}><input className={inputCls} type="email" autoComplete="email" placeholder="ex: maria@gmail.com" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value.slice(0, 160) })} /></Field>
          <Field label="CPF" error={touched ? pErr.cpf : ""}><input className={inputCls} inputMode="numeric" placeholder="000.000.000-00" value={p.cpf} onChange={(e) => setP({ ...p, cpf: maskCpf(e.target.value) })} /></Field>
          <Field label="Celular / WhatsApp" error={touched ? pErr.phone : ""}><input className={inputCls} type="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={p.phone} onChange={(e) => setP({ ...p, phone: maskPhone(e.target.value) })} /></Field>
          <Button type="submit" className="h-12 w-full text-[15px] font-bold">Ir para a entrega <ArrowRight /></Button>
        </form>
      </section>}

      {step === 2 && <section className="mt-6 rounded-lg bg-card p-5 shadow-sm">
        <StepTitle n={2} title="Entrega" sub="Cadastre ou selecione um endereço" />
        {!addressSaved ? <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setTouched(true); if (aValid) { setAddressSaved(true); setTouched(false); } }}>
          <Field label="CEP" ok={cepState === "ok"} error={cepState === "error" ? "CEP não encontrado. Confira os números." : touched && cepState !== "ok" ? "Informe um CEP válido." : ""}>
            <input className={inputCls} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={a.cep} onChange={(e) => { const v = maskCep(e.target.value); setA({ ...a, cep: v }); lookupCep(v); }} />
          </Field>
          {cepState === "loading" && <p className="text-xs text-muted-foreground">Buscando endereço…</p>}
          {cepState === "ok" && <>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" />{a.city} - {a.uf}</p>
            <Field label="Endereço" ok={!!a.street.trim()} error={touched && !a.street.trim() ? "Informe o endereço." : ""}><input className={inputCls} autoComplete="address-line1" value={a.street} onChange={(e) => setA({ ...a, street: e.target.value.slice(0, 150) })} /></Field>
            <div className="grid grid-cols-[2fr_3fr] gap-3">
              <Field label="Número" error={touched && !a.noNumber && !a.number.trim() ? "Obrigatório" : ""}><input className={inputCls} inputMode="numeric" placeholder="123" disabled={a.noNumber} value={a.number} onChange={(e) => setA({ ...a, number: e.target.value.slice(0, 10) })} /></Field>
              <Field label="Bairro" ok={!!a.district.trim()} error={touched && !a.district.trim() ? "Obrigatório" : ""}><input className={inputCls} value={a.district} onChange={(e) => setA({ ...a, district: e.target.value.slice(0, 80) })} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4" checked={a.noNumber} onChange={(e) => setA({ ...a, noNumber: e.target.checked, number: "" })} />S/N</label>
            <Field label="Complemento (opcional)"><input className={inputCls} placeholder="Apto, bloco, referência" value={a.complement} onChange={(e) => setA({ ...a, complement: e.target.value.slice(0, 100) })} /></Field>
          </>}
          <Button type="submit" className="h-12 w-full rounded-full text-[15px] font-bold">Selecionar envio <ArrowRight /></Button>
        </form> : <div>
          <div className="flex items-start gap-3 rounded-lg border-2 border-foreground/80 p-4">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[5px] border-foreground" />
            <div className="min-w-0 flex-1 text-[13px] leading-5"><strong>{a.street}, {a.noNumber ? "S/N" : a.number} - {a.district}</strong><br />{a.city} - {a.uf} | CEP {a.cep}{a.complement && <><br />{a.complement}</>}</div>
            <button type="button" onClick={() => setAddressSaved(false)} className="text-xs font-semibold text-primary underline">Editar</button>
          </div>
          <p className="mb-3 mt-6 text-sm">Escolha uma forma de entrega:</p>
          <div className="space-y-3">
            {([["free", "Frete Grátis", "7 a 12 dias úteis", "Grátis"], ["sedex", "Envio Expresso", "4 a 7 dias úteis", money(21.88)]] as const).map(([id, title, eta, price]) => <button key={id} type="button" onClick={() => setShipping(id)} className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left ${shipping === id ? "border-primary" : "border-border"}`}>
              <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${shipping === id ? "border-primary" : "border-input"}`}>{shipping === id && <span className="size-2.5 rounded-full bg-primary" />}</span>
              <span className="flex-1"><strong className="block text-sm">{title}</strong><span className="text-[13px] text-muted-foreground">{eta}</span></span>
              <span className={`text-sm font-bold ${id === "free" ? "text-success" : ""}`}>{price}</span>
            </button>)}
          </div>
          <Button onClick={() => setStep(3)} className="mt-5 h-12 w-full text-[15px] font-bold">Ir para o pagamento <ArrowRight /></Button>
        </div>}
      </section>}

      {step === 3 && <section className="mt-6 rounded-lg bg-card p-5 shadow-sm">
        {paid ? <div className="py-6 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success text-success-foreground"><Check className="size-8" /></span>
          <h2 className="mt-4 text-xl font-bold">Pagamento aprovado!</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Obrigado, {p.name.split(" ")[0]}! Seu pedido foi confirmado e você receberá as atualizações no e-mail {p.email}.</p>
          <Button onClick={() => navigate({ to: "/" })} variant="outline" className="mt-6">Voltar para a loja</Button>
        </div> : <>
          <StepTitle n={3} title="Pagamento" sub="Para finalizar seu pedido escolha uma forma de pagamento" />
          <div className={`rounded-lg border-2 p-4 ${method === "pix" ? "border-primary" : "border-border"}`}>
            <button type="button" onClick={() => setMethod("pix")} className="flex w-full items-center gap-3 text-left">
              <Radio on={method === "pix"} /><strong className="flex-1 text-[15px]">Pix</strong><span className="text-xs font-bold tracking-wider text-success">PIX</span>
            </button>
            {method === "pix" && <div className="mt-4">
              <p className="text-[15px] font-bold">Valor no pix: <span className="text-success">{money(total)}</span></p>
              {!pix ? <>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Clique em pagar com Pix para visualizar o QR Code e concluir o pagamento.</p>
                {pixError && <div role="alert" className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{pixError}</div>}
                <Button onClick={generatePix} disabled={pixLoading} className="mt-4 h-12 w-full rounded-full text-[15px] font-bold"><Lock />{pixLoading ? "Gerando PIX…" : pixError ? "Tentar novamente" : "Pagar com Pix"}</Button>
              </> : <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"><span className="size-2 animate-pulse rounded-full bg-primary" />Aguardando pagamento</div>
                <img src={pix.qrcodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pix.copyPaste)}`} alt="QR Code PIX" className="mx-auto mt-4 size-56 rounded-md border bg-background p-2" />
                <p className="mt-4 text-left text-[13px] font-medium">PIX Copia e Cola</p>
                <textarea readOnly value={pix.copyPaste} rows={3} className="mt-1 w-full resize-none rounded-md border bg-muted p-3 text-base break-all" onFocus={(e) => e.currentTarget.select()} />
                <Button onClick={copyPix} className="mt-3 h-12 w-full text-[15px] font-bold">{copied ? <><Check />PIX copiado!</> : <><Copy />COPIAR PIX</>}</Button>
                <ol className="mt-4 space-y-1 text-left text-[13px] text-muted-foreground"><li>1. Abra o app do seu banco e escolha pagar com PIX.</li><li>2. Escaneie o QR Code ou cole o código copiado.</li><li>3. Confirme o pagamento — esta tela atualiza sozinha.</li></ol>
              </div>}
            </div>}
          </div>
          <div className={`mt-3 rounded-lg border-2 p-4 ${method === "card" ? "border-primary" : "border-border"}`}>
            <button type="button" onClick={() => setMethod("card")} className="flex w-full items-center gap-3 text-left"><Radio on={method === "card"} /><strong className="flex-1 text-[15px]">Cartão de crédito</strong><CreditCard className="size-5 text-muted-foreground" /></button>
            {method === "card" && <p className="mt-3 text-sm leading-6 text-muted-foreground">No momento o pagamento por cartão está indisponível. Pague com PIX e aproveite o frete grátis.</p>}
          </div>
        </>}
      </section>}
    </main>

    <footer className="border-t bg-muted py-8 text-center">
      <div className="mx-auto max-w-xl px-5">
        <h2 className="text-sm font-bold">Formas de pagamento</h2>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px] font-bold">{["PIX", "VISA", "MASTERCARD", "ELO", "AMEX", "HIPERCARD"].map((b) => <span key={b} className="rounded border bg-background px-2.5 py-1.5">{b}</span>)}</div>
        <p className="mt-6 text-xs leading-5 text-muted-foreground">AquaLux Showers · CNPJ: 33.655.444/0001-26</p>
        <div className="mt-5 flex justify-center gap-8 text-[11px] font-bold"><span className="flex items-center gap-1.5"><Lock className="size-4" />SEGURO<br />SSL</span><span className="flex items-center gap-1.5"><ShieldCheck className="size-4" />PAGAMENTOS<br />SEGUROS</span></div>
      </div>
    </footer>
  </div>;
}

function StepTitle({ n, title, sub }: { n: number; title: string; sub: string }) {
  return <div className="mb-5"><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">{n}</span><h2 className="text-xl font-bold text-foreground/80">{title}</h2></div><p className="mt-2 text-[13px] leading-5 text-muted-foreground">{sub}</p></div>;
}
function Radio({ on }: { on: boolean }) {
  return <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-primary" : "border-input"}`}>{on && <span className="size-2.5 rounded-full bg-primary" />}</span>;
}
