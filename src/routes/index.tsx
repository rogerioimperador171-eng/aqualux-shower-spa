import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Lock, Menu, Minus, Plus, ShieldCheck, ShoppingCart, Star, Trash2, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, PRICE, productName, useCartQuantity } from "@/lib/cart";
import photo0 from "@/assets/IMG_4660.jpeg.asset.json";
import photo1 from "@/assets/IMG_4661.jpeg.asset.json";
import photo2 from "@/assets/IMG_4662.jpeg.asset.json";
import photo3 from "@/assets/IMG_4663.jpeg.asset.json";
import photo4 from "@/assets/IMG_4664.jpeg.asset.json";
import photo5 from "@/assets/IMG_4665.jpeg.asset.json";
import photo6 from "@/assets/IMG_4666.jpeg.asset.json";
import photo7 from "@/assets/IMG_4667.jpeg.asset.json";
import photo8 from "@/assets/IMG_4668.jpeg.asset.json";

const photos = [photo0, photo2, photo1, photo3, photo4, photo5, photo6, photo7, photo8];

const reviews = [
  ["Mariana S.", "O acabamento é muito bonito e deixou o banheiro com um visual mais sofisticado."],
  ["Carlos R.", "Gostei da praticidade da ducha de mão. O conjunto ficou elegante no box."],
  ["Fernanda L.", "A ducha é confortável e o visual do metal combinou bem com o banheiro."],
  ["Paulo M.", "Produto bonito, com detalhes bem apresentados e fácil de combinar com os acessórios."],
  ["Renata A.", "Adorei poder usar a ducha de mão no dia a dia. Ficou com cara de hotel."],
];

const inputCls = "h-10 w-full min-w-0 rounded-full border border-input bg-background px-4 text-center text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Chuveiro Luxo a Gás 60cm | AquaLux Showers" },
    { name: "description", content: "Conheça o chuveiro de luxo AquaLux Showers com ducha de mão, duas saídas ajustáveis e acabamento sofisticado. Confira fotos, preço e frete." },
    { property: "og:title", content: "Chuveiro Luxo a Gás 60cm | AquaLux Showers" },
    { property: "og:description", content: "Banho confortável com ducha de mão e duas saídas ajustáveis. Conheça o chuveiro AquaLux Showers." },
    { property: "og:type", content: "product" },
    { property: "og:image", content: photo0.url },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Store,
});

function Stars({ size = "size-3.5" }: { size?: string }) {
  return <span className="inline-flex text-rating" aria-label="5 estrelas">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`${size} fill-current`} />)}</span>;
}

function Gallery() {
  const [image, setImage] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const go = (index: number) => setImage((index + photos.length) % photos.length);

  // Mantém a miniatura ativa visível na faixa de miniaturas
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[image] as HTMLElement | undefined;
    if (strip && thumb) strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: "smooth" });
  }, [image]);

  const onTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; if (t) start.current = { x: t.clientX, y: t.clientY, horizontal: null }; };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = start.current, t = e.touches[0];
    if (!s || !t) return;
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (s.horizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) s.horizontal = Math.abs(dx) > Math.abs(dy);
    if (s.horizontal) { setDragging(true); setDrag(dx); }
  };
  const onTouchEnd = () => {
    const width = stageRef.current?.clientWidth ?? 1;
    if (start.current?.horizontal && Math.abs(drag) > Math.min(60, width * 0.18)) go(image + (drag < 0 ? 1 : -1));
    start.current = null; setDragging(false); setDrag(0);
  };

  return <section aria-label="Fotos do produto" aria-roledescription="carrossel">
    <div ref={stageRef} className="product-stage relative aspect-square overflow-hidden rounded-xl border border-border/60" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
      <div className={`product-track ${dragging ? "" : "animate"}`} style={{ transform: `translate3d(calc(${-image * 100}% + ${drag}px), 0, 0)` }}>
        {photos.map((photo, index) => <div key={photo.url} className="product-slide" aria-hidden={index !== image}>
          <img src={photo.url} alt={`Chuveiro AquaLux Showers — foto ${index + 1} de ${photos.length}`} loading={index === 0 ? "eager" : "lazy"} decoding="async" draggable={false} />
        </div>)}
      </div>
      <span className="absolute left-2.5 top-2.5 rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-success-foreground">67% OFF</span>
      <span className="absolute right-2.5 top-2.5 rounded-full bg-foreground/70 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-background">{image + 1}/{photos.length}</span>
      <button type="button" aria-label="Foto anterior" onClick={() => go(image - 1)} className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 shadow-sm"><ChevronLeft className="size-4" /></button>
      <button type="button" aria-label="Próxima foto" onClick={() => go(image + 1)} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 shadow-sm"><ChevronRight className="size-4" /></button>
    </div>
    <div ref={thumbsRef} className="thumb-strip mt-2.5 flex gap-1.5 overflow-x-auto px-0.5 py-0.5">
      {photos.map((photo, index) => <button key={photo.url} type="button" aria-label={`Ver foto ${index + 1}`} aria-current={image === index} onClick={() => go(index)} className={`size-12 shrink-0 overflow-hidden rounded-md border bg-white transition ${image === index ? "border-primary ring-1 ring-primary" : "border-border opacity-70"}`}>
        <img src={photo.url} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
      </button>)}
    </div>
  </section>;
}

function Store() {
  const [quantity, setQuantity] = useCartQuantity();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [zip, setZip] = useState("");
  const [zipMessage, setZipMessage] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const addToCart = () => { setQuantity((value) => Math.min(20, value + 1)); setCartOpen(true); };
  const checkZip = () => {
    if (zip.replace(/\D/g, "").length !== 8) { setZipMessage("Digite um CEP válido com 8 números."); return; }
    setZipMessage("Frete grátis no PIX. Prazo de entrega a confirmar no atendimento.");
  };

  // Trava a rolagem da página com o carrinho ou o menu abertos
  useEffect(() => {
    if (!cartOpen && !menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setCartOpen(false); setMenuOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [cartOpen, menuOpen]);

  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-14 max-w-[480px] grid-cols-[40px_1fr_40px] items-center px-3">
        <button type="button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)} className="flex size-10 items-center justify-center rounded-full hover:bg-muted"><Menu className="size-5" /></button>
        <a href="#inicio" className="text-center leading-none text-primary no-underline"><span className="brand-logo block text-[18px]">AquaLux</span><span className="eyebrow mt-0.5 block text-[8px] text-foreground">Showers</span></a>
        <button type="button" aria-label={`Abrir carrinho, ${quantity} itens`} onClick={() => setCartOpen(true)} className="relative flex size-10 items-center justify-center rounded-full hover:bg-muted"><ShoppingCart className="size-5" />{quantity > 0 && <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{quantity}</span>}</button>
      </div>
    </header>

    <main id="inicio" className="mx-auto max-w-[480px] px-4 pt-4">
      <Gallery />

      <div className="pb-6 pt-5 text-center">
        <a href="#avaliacoes" className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"><Stars /><span className="font-bold">4.9</span><span className="h-3 border-l" /><span className="font-semibold text-primary">Avaliações</span></a>
        <h1 className="mx-auto mt-3 max-w-[22rem] text-[17px] font-semibold leading-snug">{productName}</h1>
        <div className="mt-3">
          <p className="text-xs text-muted-foreground line-through">R$ 199,00</p>
          <div className="flex items-baseline justify-center gap-2"><strong className="text-[24px] font-extrabold leading-tight tracking-tight tabular-nums text-success">{money(PRICE)}</strong><span className="rounded bg-success/10 px-1.5 py-0.5 text-[11px] font-bold text-success">67% OFF</span></div>
          <p className="mt-0.5 text-xs text-muted-foreground">Em até 12x de R$ 5,47 sem juros</p>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs"><span className="flex items-center gap-1.5 font-semibold text-success"><Truck className="size-3.5" />Frete Grátis</span><span className="flex items-center gap-1.5 text-muted-foreground"><ShieldCheck className="size-3.5" />Compra 100% Segura</span></div>
        <Button onClick={addToCart} className="mt-4 h-11 w-full rounded-full text-[13px] font-bold tracking-wider">COMPRAR AGORA <ArrowRight /></Button>

        <section className="mt-6 rounded-xl border p-4" aria-label="Frete e entrega">
          <h2 className="flex items-center justify-center gap-1.5 text-[15px] font-semibold"><Truck className="size-4 text-primary" />Frete e Entrega</h2>
          <div className="mt-3 flex gap-2"><input value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2"))} onKeyDown={(event) => { if (event.key === "Enter") checkZip(); }} aria-label="CEP para entrega" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" className={inputCls} /><Button onClick={checkZip} className="h-10 shrink-0 rounded-full px-4 text-xs font-bold">Calcular</Button></div>
          {zipMessage && <p role="status" className="mt-2 text-xs text-muted-foreground">{zipMessage}</p>}
          <a className="mt-2 inline-block text-[11px] text-muted-foreground underline" href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer">Não sei meu CEP</a>
        </section>

        <section id="descricao" className="scroll-mt-16 border-b py-6">
          <p className="eyebrow text-primary">Detalhes</p>
          <h2 className="mt-1 text-lg font-semibold">Descrição do produto</h2>
          <div className="mt-4 space-y-3 rounded-xl bg-muted p-4 text-[13px] leading-6 text-foreground/85">
            <h3 className="text-[15px] font-semibold text-foreground">Chuveiro a Gás 60cm Luxo — Banho Ducha Luxuosa com Chuveiro de Mão e 2 Saídas Ajustáveis</h3>
            <p>Transforme seu banho em uma experiência de spa! Com design moderno e acabamento premium, este chuveiro oferece duas saídas de água ajustáveis: a ducha principal ampla e o chuveiro de mão, proporcionando conforto e praticidade no dia a dia.</p>
            <p>Perfeito para quem busca qualidade e sofisticação no padrão de hotéis de luxo.</p>
            <h3 className="pt-1 text-[15px] font-semibold text-foreground">Características</h3>
            <CheckList items={["Tamanho: 60 cm — amplo e elegante", "Duas saídas de água ajustáveis: ducha superior e chuveiro de mão", "Design moderno e acabamento de luxo", "Instalação padrão hotel, fácil e prática", "Compatível com aquecimento a gás para água sempre na temperatura ideal"]} />
            <h3 className="pt-1 text-[15px] font-semibold text-foreground">Benefícios</h3>
            <CheckList items={["Banho relaxante e confortável, como em um spa", "Mais praticidade com chuveiro de mão incluso", "Acabamento sofisticado que valoriza o banheiro", "Ajuste de fluxo para economia e personalização", "Qualidade e durabilidade para uso prolongado"]} />
            <p className="pt-1"><strong>Dica:</strong> Combine com acessórios de banheiro cromados para um ambiente ainda mais elegante e funcional.</p>
          </div>
        </section>

        <section id="avaliacoes" className="scroll-mt-16 py-6">
          <p className="eyebrow text-primary">Clientes</p>
          <h2 className="mt-1 text-lg font-semibold">Avaliações</h2>
          <div className="mt-2 flex items-center justify-center gap-2"><strong className="text-xl font-extrabold">4.9</strong><Stars size="size-4" /></div>
          <p className="mt-1 text-[11px] text-muted-foreground">Exemplos ilustrativos de avaliações do produto.</p>
          <div className="mt-4 space-y-2.5">{reviews.slice(0, showAllReviews ? 5 : 3).map(([name, text]) => <div key={name} className="rounded-xl border p-3.5"><div className="flex flex-col items-center gap-1"><strong className="text-[13px]">{name}</strong><Stars size="size-3" /></div><p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{text}</p></div>)}</div>
          <Button variant="outline" onClick={() => setShowAllReviews((value) => !value)} className="mt-3 h-9 w-full rounded-full text-xs font-semibold">{showAllReviews ? "Ver menos avaliações" : "Ver mais avaliações"}</Button>
        </section>
      </div>
    </main>

    <section id="newsletter" className="relative isolate scroll-mt-16 overflow-hidden py-10 text-center text-primary-foreground"><img src={photo2.url} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" /><div className="newsletter-shade absolute inset-0 -z-10" /><div className="mx-auto max-w-[480px] px-6"><p className="eyebrow opacity-90">AquaLux Showers</p><h2 className="mb-2 mt-1 text-xl font-semibold">Newsletter</h2><p className="mb-5 text-xs leading-5 opacity-90">Novidades e ofertas para transformar sua experiência de banho.</p><form onSubmit={(event) => { event.preventDefault(); setNewsletterMessage("Cadastro demonstrativo. O envio de novidades ainda não está ativo."); }} className="space-y-2.5"><input required aria-label="Nome completo" placeholder="Nome completo" autoComplete="name" className={`${inputCls} text-foreground`} /><input required type="tel" aria-label="Telefone" placeholder="Telefone" autoComplete="tel" className={`${inputCls} text-foreground`} /><input required type="email" aria-label="E-mail" placeholder="E-mail" autoComplete="email" className={`${inputCls} text-foreground`} /><Button type="submit" className="h-10 w-full rounded-full bg-background text-xs font-bold tracking-wider text-primary hover:bg-background/90">CADASTRAR</Button></form>{newsletterMessage && <p role="status" className="mt-3 text-xs">{newsletterMessage}</p>}<p className="mt-3 text-[10px] opacity-80">Ao clicar em Cadastrar você declara que aceita os Termos de Privacidade.</p></div></section>

    <footer className="border-t text-center"><div className="mx-auto max-w-[480px] px-5 py-7"><h2 className="brand-logo text-lg text-primary">AquaLux Showers</h2><p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-muted-foreground">Banhos mais confortáveis com design sofisticado, ducha de mão e soluções práticas para o seu banheiro.</p><p className="mt-5 border-t pt-4 text-[10px] leading-4 text-muted-foreground">Preços, promoções e condições de frete estão sujeitos à confirmação na compra. As imagens são ilustrativas. CNPJ informado no site anterior: 33.655.444/0001-26. © 2026 AquaLux Showers.</p></div></footer>

    {menuOpen && <div className="fixed inset-0 z-50"><div className="drawer-shade absolute inset-0" onClick={() => setMenuOpen(false)} /><aside role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-y-0 left-0 w-[min(80vw,300px)] bg-background p-4 shadow-xl"><div className="mb-6 flex items-center justify-between"><strong className="brand-logo text-lg text-primary">AquaLux Showers</strong><button type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="flex size-9 items-center justify-center rounded-full hover:bg-muted"><X className="size-4" /></button></div><nav className="flex flex-col text-center">{[["Produto", "#inicio"], ["Descrição", "#descricao"], ["Avaliações", "#avaliacoes"], ["Newsletter", "#newsletter"]].map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} className="border-b py-3 text-[13px] font-semibold">{label}</a>)}</nav></aside></div>}

    {cartOpen && <div className="fixed inset-0 z-50"><div className="drawer-shade absolute inset-0" onClick={() => setCartOpen(false)} /><aside role="dialog" aria-modal="true" aria-label="Carrinho de compras" className="absolute inset-y-0 right-0 flex w-[min(100vw,400px)] flex-col bg-background shadow-xl">
      <div className="grid grid-cols-[36px_1fr_36px] items-center border-b px-3 py-3"><span /><h2 className="text-center text-base font-semibold">Meu Carrinho ({quantity})</h2><button type="button" aria-label="Fechar carrinho" onClick={() => setCartOpen(false)} className="flex size-9 items-center justify-center rounded-full hover:bg-muted"><X className="size-4" /></button></div>
      {quantity === 0 ? <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"><ShoppingCart className="size-10 text-muted-foreground" /><p className="text-sm">Seu carrinho está vazio.</p><Button onClick={() => setCartOpen(false)} className="h-9 rounded-full px-5 text-xs font-bold">Continuar comprando</Button></div> : <>
        <div className="flex-1 overflow-auto p-4">
          <div className="flex gap-3 rounded-xl border p-3">
            <img src={photo0.url} alt="Chuveiro AquaLux Showers" className="size-20 shrink-0 rounded-lg border bg-white object-contain" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-3 text-xs font-medium leading-4">{productName}</p>
              <p className="mt-1.5 text-sm font-bold text-success">{money(PRICE)}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <QtyButton label="Diminuir quantidade" onClick={() => setQuantity((value) => Math.max(0, value - 1))}><Minus /></QtyButton>
                <span className="w-6 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                <QtyButton label="Aumentar quantidade" onClick={() => setQuantity((value) => Math.min(20, value + 1))} disabled={quantity >= 20}><Plus /></QtyButton>
                <button type="button" aria-label="Remover produto" onClick={() => setQuantity(0)} className="ml-auto flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mb-3 flex items-center justify-between text-sm font-bold"><span className="eyebrow text-[11px] text-foreground">Total</span><span className="text-lg font-extrabold tabular-nums text-primary">{money(quantity * PRICE)}</span></div>
          <div className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-muted p-2.5 text-center text-[11px]"><Truck className="size-4 shrink-0 text-success" /><span><strong>Frete Grátis no PIX</strong> · Consulte as condições de entrega.</span></div>
          <Button asChild className="h-11 w-full rounded-full text-[13px] font-bold tracking-wider"><Link to="/checkout" search={{ qtd: quantity }} onClick={() => setCartOpen(false)}><Lock />FINALIZAR COMPRA</Link></Button>
          <button type="button" onClick={() => setCartOpen(false)} className="mt-2 w-full py-1.5 text-center text-xs font-medium text-muted-foreground underline">Continuar comprando</button>
        </div>
      </>}
    </aside></div>}
  </div>;
}

function CheckList({ items }: { items: string[] }) {
  return <ul className="space-y-1.5">{items.map((item) => <li key={item} className="flex items-start justify-center gap-1.5"><Check className="mt-1 size-3.5 shrink-0 text-success" /><span>{item}</span></li>)}</ul>;
}

function QtyButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className="flex size-7 items-center justify-center rounded-full border border-input hover:bg-muted disabled:opacity-40 [&_svg]:size-3.5">{children}</button>;
}
