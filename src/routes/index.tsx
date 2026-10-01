import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, Minus, Plus, ShieldCheck, ShoppingCart, Star, Trash2, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import photo0 from "@/assets/IMG_4660.jpeg.asset.json";
import photo1 from "@/assets/IMG_4661.jpeg.asset.json";
import photo2 from "@/assets/IMG_4662.jpeg.asset.json";
import photo3 from "@/assets/IMG_4663.jpeg.asset.json";
import photo4 from "@/assets/IMG_4664.jpeg.asset.json";
import photo5 from "@/assets/IMG_4665.jpeg.asset.json";
import photo6 from "@/assets/IMG_4666.jpeg.asset.json";
import photo7 from "@/assets/IMG_4667.jpeg.asset.json";
import photo8 from "@/assets/IMG_4668.jpeg.asset.json";

const productName = "Chuveiro Luxo a Gás 60cm Banho Ducha Luxuosa e Chuveiro de mão 2 Saídas Instalação Padrão Hotel Ajustável";
const photos = [photo0, photo2, photo1, photo3, photo4, photo5, photo6, photo7, photo8];
const money = (amount: number) => amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Chuveiro Luxo a Gás 60cm | AquaLux Showers" },
    { name: "description", content: "Conheça o chuveiro de luxo AquaLux Showers com ducha de mão, duas saídas ajustáveis e acabamento sofisticado. Confira fotos, preço e frete." },
    { property: "og:title", content: "Chuveiro Luxo a Gás 60cm | AquaLux Showers" },
    { property: "og:description", content: "Banho confortável com ducha de mão e duas saídas ajustáveis. Conheça o chuveiro AquaLux Showers." },
    { property: "og:type", content: "product" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Store,
});

function Store() {
  const [image, setImage] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [zip, setZip] = useState("");
  const [zipMessage, setZipMessage] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [drag, setDrag] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const horizontal = useRef(false);
  const moveImage = (step: number) => setImage((current) => (current + step + photos.length) % photos.length);
  const addToCart = () => { setQuantity((value) => value + 1); setCartOpen(true); };
  const checkZip = () => {
    if (zip.replace(/\D/g, "").length !== 8) { setZipMessage("Digite um CEP válido com 8 números."); return; }
    setZipMessage("Frete grátis no PIX. Prazo de entrega a confirmar no atendimento.");
  };

  useEffect(() => {
    document.body.style.overflow = cartOpen || menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, menuOpen]);

  const onTouchStart = (event: React.TouchEvent) => {
    const t = event.touches[0];
    touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
    horizontal.current = false;
  };
  const onTouchMove = (event: React.TouchEvent) => {
    const t = event.touches[0];
    if (!touchStart.current || !t) return;
    const dx = t.clientX - touchStart.current.x, dy = t.clientY - touchStart.current.y;
    if (!horizontal.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) horizontal.current = true;
    if (horizontal.current) setDrag(dx);
  };
  const onTouchEnd = () => {
    if (horizontal.current && Math.abs(drag) > 40) moveImage(drag < 0 ? 1 : -1);
    touchStart.current = null; horizontal.current = false; setDrag(0);
  };

  const stars = (size: string) => Array.from({ length: 5 }, (_, i) => <Star key={i} className={`${size} fill-current`} />);

  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-3 md:px-8">
        <Button variant="ghost" size="icon" aria-label="Abrir menu" title="Abrir menu" onClick={() => setMenuOpen(true)} className="size-9"><Menu className="!size-5" /></Button>
        <a href="#inicio" className="text-center leading-none text-primary no-underline"><span className="brand-logo block text-[18px]">AquaLux</span><span className="block text-[8px] font-semibold tracking-[0.42em] text-foreground">SHOWERS</span></a>
        <Button variant="ghost" size="icon" aria-label={`Abrir carrinho, ${quantity} itens`} title="Abrir carrinho" onClick={() => setCartOpen(true)} className="relative size-9"><ShoppingCart className="!size-5" />{quantity > 0 && <span className="price absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">{quantity}</span>}</Button>
      </div>
    </header>

    <main id="inicio" className="mx-auto max-w-6xl md:px-8">
      <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-10 md:pt-7">
        <section aria-label="Fotos do produto" className="min-w-0 md:sticky md:top-24 md:self-start">
          <div className="product-stage relative mx-3 mt-3 aspect-square touch-pan-y overflow-hidden rounded-lg border border-border/40 md:mx-0 md:mt-0" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
            <div className="slider-track" style={{ transform: `translateX(calc(${-image * 100}% + ${drag}px))`, transition: drag ? "none" : undefined }}>
              {photos.map((photo, index) => <img key={photo.url} src={photo.url} alt={`Chuveiro AquaLux Showers — foto ${index + 1} de ${photos.length}`} loading={index === 0 ? "eager" : "lazy"} className="select-none" draggable={false} />)}
            </div>
            <span className="absolute left-2.5 top-2.5 rounded-full bg-success px-2.5 py-0.5 text-[11px] font-bold text-success-foreground">67% OFF</span>
            <span className="price absolute bottom-2.5 right-2.5 rounded-full bg-foreground/60 px-2 py-0.5 text-[10px] font-medium text-background">{image + 1}/{photos.length}</span>
            <Button variant="outline" size="icon" aria-label="Foto anterior" title="Foto anterior" onClick={() => moveImage(-1)} className="absolute left-2 top-1/2 size-8 -translate-y-1/2 rounded-full bg-background/80"><ChevronLeft className="!size-4" /></Button>
            <Button variant="outline" size="icon" aria-label="Próxima foto" title="Próxima foto" onClick={() => moveImage(1)} className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-full bg-background/80"><ChevronRight className="!size-4" /></Button>
          </div>
          <div className="mx-3 mt-2.5 flex gap-2 overflow-x-auto pb-1 md:mx-0 md:flex-wrap">{photos.map((photo, index) => <button key={index} type="button" aria-label={`Ver foto ${index + 1}`} title={`Ver foto ${index + 1}`} onClick={() => setImage(index)} className={`size-12 shrink-0 overflow-hidden rounded-md border bg-background md:size-[64px] ${image === index ? "border-primary ring-1 ring-primary" : "opacity-70"}`}><img src={photo.url} alt="" loading="lazy" className="h-full w-full object-cover" /></button>)}</div>
        </section>

        <div className="px-4 pb-6 pt-4 text-center md:px-0 md:pt-0 md:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs"><span className="flex text-rating" aria-label="5 estrelas">{stars("size-3")}</span><span className="price font-semibold">4.9</span><span className="h-3 border-l" /><a href="#avaliacoes" className="font-semibold text-primary">Avaliações</a></div>
          <h1 className="mx-auto mt-3 max-w-md text-[16px] font-bold leading-snug md:mx-0 md:text-xl">{productName}</h1>
          <div className="price mt-3"><p className="text-xs text-muted-foreground line-through">R$ 199,00</p><div className="flex flex-wrap items-baseline justify-center gap-2 md:justify-start"><strong className="text-2xl font-bold leading-tight text-success">R$ 65,67</strong><span className="rounded bg-success/10 px-1.5 py-0.5 text-xs font-semibold text-success">67% OFF</span></div><p className="mt-0.5 text-xs text-muted-foreground">Em até 12x de R$ 5,47 sem juros</p></div>
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs md:justify-start"><span className="flex items-center gap-1.5 font-medium text-success"><Truck className="size-3.5" />Frete Grátis</span><span className="flex items-center gap-1.5 text-muted-foreground"><ShieldCheck className="size-3.5" />Compra 100% Segura</span></div>
          <Button onClick={addToCart} className="mx-auto mt-4 flex h-11 w-full max-w-sm rounded-md text-sm font-bold tracking-wide md:mx-0">COMPRAR AGORA</Button>

          <section className="mt-6 border-b pb-4 text-left" aria-label="Frete e entrega"><div className="mb-2 flex items-center justify-between gap-3"><h2 className="flex items-center gap-1.5 text-sm font-semibold"><Truck className="size-4 text-primary" />Frete e Entrega</h2><a className="text-xs text-muted-foreground underline" href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer">Não sei meu CEP</a></div><div className="flex gap-2"><input value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2"))} onKeyDown={(event) => { if (event.key === "Enter") checkZip(); }} aria-label="CEP para entrega" inputMode="numeric" placeholder="00000-000" className="h-10 min-w-0 flex-1 rounded-full border border-primary/30 bg-background px-4 outline-none focus:border-primary" /><Button onClick={checkZip} className="h-10 rounded-full px-4 text-xs font-semibold">Calcular</Button></div>{zipMessage && <p role="status" className="mt-2 text-xs text-muted-foreground">{zipMessage}</p>}</section>

          <section id="descricao" className="scroll-mt-16 border-b py-5"><h2 className="mb-3 text-sm font-bold tracking-wide text-primary">DESCRIÇÃO DO PRODUTO</h2><div className="space-y-3 rounded-lg bg-muted p-4 text-[13px] leading-6"><h3 className="text-sm font-bold">Chuveiro a Gás 60cm Luxo — Banho Ducha Luxuosa com Chuveiro de Mão e 2 Saídas Ajustáveis</h3><p>Transforme seu banho em uma experiência de spa! Com design moderno e acabamento premium, este chuveiro oferece duas saídas de água ajustáveis: a ducha principal ampla e o chuveiro de mão, proporcionando conforto e praticidade no dia a dia.</p><p>Perfeito para quem busca qualidade e sofisticação no padrão de hotéis de luxo.</p><h3 className="text-sm font-bold">Características</h3><ul className="mx-auto inline-block list-disc space-y-1 pl-5 text-left"><li>Tamanho: 60 cm — amplo e elegante</li><li>Duas saídas de água ajustáveis: ducha superior e chuveiro de mão</li><li>Design moderno e acabamento de luxo</li><li>Instalação padrão hotel, fácil e prática</li><li>Compatível com aquecimento a gás para água sempre na temperatura ideal</li></ul><h3 className="text-sm font-bold">Benefícios</h3><ul className="mx-auto inline-block list-disc space-y-1 pl-5 text-left"><li>Banho relaxante e confortável, como em um spa</li><li>Mais praticidade com chuveiro de mão incluso</li><li>Acabamento sofisticado que valoriza o banheiro</li><li>Ajuste de fluxo para economia e personalização</li><li>Qualidade e durabilidade para uso prolongado</li></ul><p><strong>Dica:</strong> Combine com acessórios de banheiro cromados para um ambiente ainda mais elegante e funcional.</p></div></section>

          <section id="avaliacoes" className="scroll-mt-16 py-5"><h2 className="mb-2 text-sm font-bold tracking-wide">AVALIAÇÕES</h2><div className="mb-2 flex items-center justify-center gap-2 md:justify-start"><strong className="price text-xl">4.9</strong><span className="flex text-rating">{stars("size-3.5")}</span></div><p className="mb-3 text-[11px] text-muted-foreground">Exemplos ilustrativos de avaliações do produto.</p>{[
            ["Mariana S.", "O acabamento é muito bonito e deixou o banheiro com um visual mais sofisticado."],
            ["Carlos R.", "Gostei da praticidade da ducha de mão. O conjunto ficou elegante no box."],
            ["Fernanda L.", "A ducha é confortável e o visual do metal combinou bem com o banheiro."],
            ["Paulo M.", "Produto bonito, com detalhes bem apresentados e fácil de combinar com os acessórios."],
            ["Renata A.", "Adorei poder usar a ducha de mão no dia a dia. Ficou com cara de hotel."],
          ].slice(0, showAllReviews ? 5 : 3).map(([name, text]) => <div key={name} className="border-t py-3 text-left"><div className="flex items-center justify-between"><strong className="text-[13px]">{name}</strong><span className="flex text-rating">{stars("size-3")}</span></div><p className="mt-1 text-[13px] leading-5 text-muted-foreground">{text}</p></div>)}<Button variant="outline" onClick={() => setShowAllReviews((value) => !value)} className="mt-2 h-9 w-full text-xs">{showAllReviews ? "Ver menos avaliações" : "Ver mais avaliações"}</Button></section>
        </div>
      </div>
    </main>

    <section id="newsletter" className="relative isolate overflow-hidden py-10 text-center text-primary-foreground"><img src={photo2.url} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" /><div className="newsletter-shade absolute inset-0 -z-10" /><div className="mx-auto max-w-sm px-6"><p className="brand-logo mb-1 text-sm tracking-widest">AquaLux Showers</p><h2 className="mb-2 text-lg font-extrabold tracking-wide">NEWSLETTER</h2><p className="mb-4 text-xs leading-5">Novidades e ofertas para transformar sua experiência de banho.</p><form onSubmit={(event) => { event.preventDefault(); setNewsletterMessage("Cadastro demonstrativo. O envio de novidades ainda não está ativo."); }} className="space-y-2.5"><input required aria-label="Nome completo" placeholder="Nome completo" className="h-10 w-full rounded-full border border-primary-foreground/30 bg-background px-4 text-foreground outline-none" /><input required type="tel" aria-label="Telefone" placeholder="Telefone" className="h-10 w-full rounded-full border border-primary-foreground/30 bg-background px-4 text-foreground outline-none" /><input required type="email" aria-label="E-mail" placeholder="E-mail" className="h-10 w-full rounded-full border border-primary-foreground/30 bg-background px-4 text-foreground outline-none" /><Button type="submit" className="h-10 w-full rounded-full bg-background text-sm font-bold text-primary hover:bg-background/90">Cadastrar</Button></form>{newsletterMessage && <p role="status" className="mt-3 text-xs">{newsletterMessage}</p>}<p className="mt-3 text-[11px] opacity-80">Ao clicar em Cadastrar você declara que aceita os Termos de Privacidade.</p></div></section>

    <footer className="border-t text-center"><div className="mx-auto max-w-6xl px-5 py-6"><h2 className="brand-logo text-base text-primary">AquaLux Showers</h2><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-muted-foreground">Banhos mais confortáveis com design sofisticado, ducha de mão e soluções práticas para o seu banheiro.</p><p className="mt-4 border-t pt-4 text-[11px] leading-5 text-muted-foreground">Preços, promoções e condições de frete estão sujeitos à confirmação na compra. As imagens são ilustrativas. CNPJ informado no site anterior: 33.655.444/0001-26. © 2026 AquaLux Showers.</p></div></footer>

    {menuOpen && <div className="fixed inset-0 z-50"><div className="drawer-shade absolute inset-0" onClick={() => setMenuOpen(false)} /><aside className="absolute inset-y-0 left-0 w-[min(80vw,300px)] bg-background p-4 shadow-xl"><div className="mb-6 flex items-center justify-between"><strong className="brand-logo text-base text-primary">AquaLux Showers</strong><Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="size-8"><X className="!size-4" /></Button></div><nav className="flex flex-col">{[["Produto", "#inicio"], ["Descrição", "#descricao"], ["Avaliações", "#avaliacoes"], ["Newsletter", "#newsletter"]].map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} className="border-b py-3 text-sm font-medium">{label}</a>)}</nav></aside></div>}

    {cartOpen && <div className="fixed inset-0 z-50"><div className="drawer-shade absolute inset-0" onClick={() => setCartOpen(false)} /><aside role="dialog" aria-modal="true" aria-label="Carrinho de compras" className="absolute inset-y-0 right-0 flex w-[min(100vw,400px)] flex-col bg-background shadow-xl"><div className="flex items-center justify-between border-b px-4 py-3"><h2 className="text-sm font-bold">Meu Carrinho (<span className="price">{quantity}</span>)</h2><Button variant="ghost" size="icon" aria-label="Fechar carrinho" onClick={() => setCartOpen(false)} className="size-8"><X className="!size-4" /></Button></div>{quantity === 0 ? <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"><ShoppingCart className="size-10 text-muted-foreground" /><p className="text-sm">Seu carrinho está vazio.</p><Button onClick={() => setCartOpen(false)} className="h-9 text-xs">Continuar comprando</Button></div> : <><div className="flex-1 overflow-auto p-4"><div className="flex gap-3"><img src={photo0.url} alt="Chuveiro AquaLux Showers" className="size-20 shrink-0 rounded-md border bg-background object-contain" /><div className="min-w-0 flex-1"><p className="line-clamp-3 text-xs font-medium leading-4">{productName}</p><p className="price mt-1.5 text-sm font-bold text-success">R$ 65,67</p><div className="mt-2 flex items-center gap-1.5"><Button variant="outline" size="icon" aria-label="Diminuir quantidade" onClick={() => setQuantity((value) => Math.max(0, value - 1))} className="size-7"><Minus className="!size-3.5" /></Button><span className="price w-6 text-center text-sm">{quantity}</span><Button variant="outline" size="icon" aria-label="Aumentar quantidade" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="size-7"><Plus className="!size-3.5" /></Button><Button variant="ghost" size="icon" aria-label="Remover produto" title="Remover produto" onClick={() => setQuantity(0)} className="ml-auto size-7"><Trash2 className="!size-3.5" /></Button></div></div></div></div><div className="border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><div className="mb-3 flex justify-between text-sm font-bold"><span>TOTAL</span><span className="price text-base text-primary">{money(quantity * 65.67)}</span></div><div className="mb-3 flex items-center gap-2 rounded-md bg-muted p-2.5 text-xs"><Truck className="size-4 shrink-0 text-success" /><span><strong>Frete Grátis no PIX</strong><br />Consulte as condições de entrega.</span></div><Link to="/checkout" search={{ qtd: quantity }} onClick={() => setCartOpen(false)} className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">Finalizar Compra</Link><button type="button" onClick={() => setCartOpen(false)} className="mt-2 w-full py-1.5 text-center text-xs text-muted-foreground underline">Continuar comprando</button></div></>}</aside></div>}
  </div>;
}
