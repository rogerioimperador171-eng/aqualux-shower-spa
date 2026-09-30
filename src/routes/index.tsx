import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Menu, Minus, Plus, ShieldCheck, ShoppingCart, Star, Trash2, Truck, X } from "lucide-react";
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
  const touchStart = useRef<number | null>(null);
  const moveImage = (step: number) => setImage((current) => (current + step + photos.length) % photos.length);
  const addToCart = () => { setQuantity((value) => value + 1); setCartOpen(true); };
  const checkZip = () => {
    if (zip.replace(/\D/g, "").length !== 8) { setZipMessage("Digite um CEP válido com 8 números."); return; }
    setZipMessage("Frete grátis no PIX. Prazo de entrega a confirmar no atendimento.");
  };

  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4 md:px-8">
        <Button variant="ghost" size="icon" aria-label="Abrir menu" title="Abrir menu" onClick={() => setMenuOpen(true)}><Menu className="!size-6" /></Button>
        <a href="#inicio" className="text-center font-extrabold leading-none text-primary no-underline"><span className="block text-[19px]">AquaLux</span><span className="block text-[11px] tracking-widest text-foreground">SHOWERS</span></a>
        <Button variant="ghost" size="icon" aria-label={`Abrir carrinho, ${quantity} itens`} title="Abrir carrinho" onClick={() => setCartOpen(true)} className="relative"><ShoppingCart className="!size-6" />{quantity > 0 && <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{quantity}</span>}</Button>
      </div>
    </header>

    <main id="inicio" className="mx-auto max-w-6xl md:px-8">
      <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-10 md:pt-7">
        <section aria-label="Fotos do produto" className="min-w-0 md:sticky md:top-24 md:self-start">
          <div className="product-stage relative mx-4 mt-4 aspect-square overflow-hidden rounded-md border border-border/30 md:mx-0 md:mt-0" onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientX; if (touchStart.current !== null && end !== undefined && Math.abs(touchStart.current - end) > 40) moveImage(touchStart.current > end ? 1 : -1); touchStart.current = null; }}>
            <img src={photos[image].url} alt={`Chuveiro AquaLux Showers — foto ${image + 1} de ${photos.length}`} className="select-none" draggable={false} />
            <span className="absolute left-3 top-3 rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground">67% OFF</span>
            <Button variant="outline" size="icon" aria-label="Foto anterior" title="Foto anterior" onClick={() => moveImage(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-80"><ChevronLeft /></Button>
            <Button variant="outline" size="icon" aria-label="Próxima foto" title="Próxima foto" onClick={() => moveImage(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-80"><ChevronRight /></Button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 md:hidden">{photos.map((_, index) => <Button key={index} variant="ghost" size="icon" aria-label={`Ver foto ${index + 1}`} onClick={() => setImage(index)} className="!size-4 rounded-full p-0"><span className={`size-2 rounded-full ${image === index ? "bg-primary" : "bg-input"}`} /></Button>)}</div>
          <div className="mt-4 hidden flex-wrap gap-2 md:flex">{photos.map((photo, index) => <Button key={index} variant="outline" aria-label={`Ver foto ${index + 1}`} title={`Ver foto ${index + 1}`} onClick={() => setImage(index)} className={`!size-[68px] overflow-hidden rounded-md p-0 ${image === index ? "ring-2 ring-primary" : ""}`}><img src={photo.url} alt="" className="h-full w-full object-cover" /></Button>)}</div>
        </section>

        <div className="px-4 pb-8 pt-5 md:px-0 md:pt-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm"><span className="flex text-rating" aria-label="5 estrelas">{Array.from({length: 5}, (_, i) => <Star key={i} className="size-4 fill-current" />)}</span><span className="font-semibold">4.9</span><span className="h-4 border-l" /><span className="font-semibold text-primary">Avaliações</span></div>
          <h1 className="mt-5 text-xl font-bold leading-snug md:text-2xl">{productName}</h1>
          <div className="mt-4"><p className="text-sm text-muted-foreground line-through">R$ 199,00</p><div className="flex flex-wrap items-baseline gap-2"><strong className="text-[28px] leading-tight text-success">R$ 65,67</strong><span className="text-sm font-medium text-success">67% OFF</span></div><p className="mt-1 text-sm text-muted-foreground">Em até 12x de R$ 5,47 sem juros</p></div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm"><span className="flex items-center gap-2 text-success"><Truck className="size-4" />Frete Grátis</span><span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="size-4" />Compra 100% Segura</span></div>
          <Button onClick={addToCart} className="mt-5 h-[60px] w-full rounded-md text-base font-bold">COMPRAR AGORA</Button>

          <section className="mt-8 border-b pb-5" aria-label="Frete e entrega"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-semibold italic"><Truck className="size-5 text-primary" />Frete e Entrega</h2><a className="text-sm text-muted-foreground underline" href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer">Não sei meu CEP</a></div><div className="flex gap-2"><input value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2"))} onKeyDown={(event) => { if (event.key === "Enter") checkZip(); }} aria-label="CEP para entrega" inputMode="numeric" placeholder="00000-000" className="min-w-0 flex-1 rounded-full border-2 border-primary/30 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /><Button onClick={checkZip} className="h-auto rounded-full px-5 font-semibold">Calcular</Button></div>{zipMessage && <p role="status" className="mt-2 text-sm text-muted-foreground">{zipMessage}</p>}</section>

          <section id="descricao" className="border-b py-6"><h2 className="mb-4 text-lg font-bold text-primary">DESCRIÇÃO DO PRODUTO</h2><div className="space-y-4 rounded-md bg-muted p-4 text-[15px] leading-7"><h3 className="font-bold">Chuveiro a Gás 60cm Luxo — Banho Ducha Luxuosa com Chuveiro de Mão e 2 Saídas Ajustáveis</h3><p>Transforme seu banho em uma experiência de spa! Com design moderno e acabamento premium, este chuveiro oferece duas saídas de água ajustáveis: a ducha principal ampla e o chuveiro de mão, proporcionando conforto e praticidade no dia a dia.</p><p>Perfeito para quem busca qualidade e sofisticação no padrão de hotéis de luxo.</p><h3 className="font-bold">Características</h3><ul className="list-disc space-y-1 pl-5"><li>Tamanho: 60 cm — amplo e elegante</li><li>Duas saídas de água ajustáveis: ducha superior e chuveiro de mão</li><li>Design moderno e acabamento de luxo</li><li>Instalação padrão hotel, fácil e prática</li><li>Compatível com aquecimento a gás para água sempre na temperatura ideal</li></ul><h3 className="font-bold">Benefícios</h3><ul className="list-disc space-y-1 pl-5"><li>Banho relaxante e confortável, como em um spa</li><li>Mais praticidade com chuveiro de mão incluso</li><li>Acabamento sofisticado que valoriza o banheiro</li><li>Ajuste de fluxo para economia e personalização</li><li>Qualidade e durabilidade para uso prolongado</li></ul><p><strong>Dica:</strong> Combine com acessórios de banheiro cromados para um ambiente ainda mais elegante e funcional.</p></div></section>

          <section id="avaliacoes" className="py-6"><h2 className="mb-4 text-sm font-bold">AVALIAÇÕES</h2><div className="mb-4 flex items-center gap-3"><strong className="text-2xl">4.9</strong><span className="flex text-rating">{Array.from({length: 5}, (_, i) => <Star key={i} className="size-4 fill-current" />)}</span></div><p className="mb-4 text-xs text-muted-foreground">Exemplos ilustrativos de avaliações do produto.</p>{[
            ["Mariana S.", "O acabamento é muito bonito e deixou o banheiro com um visual mais sofisticado."],
            ["Carlos R.", "Gostei da praticidade da ducha de mão. O conjunto ficou elegante no box."],
            ["Fernanda L.", "A ducha é confortável e o visual do metal combinou bem com o banheiro."],
            ["Paulo M.", "Produto bonito, com detalhes bem apresentados e fácil de combinar com os acessórios."],
            ["Renata A.", "Adorei poder usar a ducha de mão no dia a dia. Ficou com cara de hotel."],
          ].slice(0, showAllReviews ? 5 : 3).map(([name, text]) => <div key={name} className="border-t py-4"><div className="flex items-center justify-between"><strong className="text-sm">{name}</strong><span className="flex text-rating">{Array.from({length: 5}, (_, i) => <Star key={i} className="size-3 fill-current" />)}</span></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}<Button variant="outline" onClick={() => setShowAllReviews((value) => !value)} className="mt-2 w-full">{showAllReviews ? "Ver menos avaliações" : "Ver mais avaliações"}</Button></section>
        </div>
      </div>
    </main>

    <section id="newsletter" className="relative isolate overflow-hidden py-14 text-center text-primary-foreground"><img src={photo2.url} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" /><div className="newsletter-shade absolute inset-0 -z-10" /><div className="mx-auto max-w-md px-6"><p className="mb-2 text-sm font-bold tracking-widest">AQUALUX SHOWERS</p><h2 className="mb-3 text-2xl font-extrabold">NEWSLETTER</h2><p className="mb-6 text-sm leading-6">Novidades e ofertas para transformar sua experiência de banho.</p><form onSubmit={(event) => { event.preventDefault(); setNewsletterMessage("Cadastro demonstrativo. O envio de novidades ainda não está ativo."); }} className="space-y-3"><input required aria-label="Nome completo" placeholder="Nome completo" className="h-12 w-full rounded-full border border-primary-foreground/30 bg-background px-5 text-foreground outline-none" /><input required type="tel" aria-label="Telefone" placeholder="Telefone" className="h-12 w-full rounded-full border border-primary-foreground/30 bg-background px-5 text-foreground outline-none" /><input required type="email" aria-label="E-mail" placeholder="E-mail" className="h-12 w-full rounded-full border border-primary-foreground/30 bg-background px-5 text-foreground outline-none" /><Button type="submit" className="h-12 w-full rounded-full bg-background font-bold text-primary hover:bg-background/90">Cadastrar</Button></form>{newsletterMessage && <p role="status" className="mt-3 text-sm">{newsletterMessage}</p>}<p className="mt-4 text-xs opacity-80">Ao clicar em Cadastrar você declara que aceita os Termos de Privacidade.</p></div></section>

    <footer className="border-t text-center"><div className="mx-auto max-w-6xl px-5 py-8"><h2 className="text-lg font-extrabold text-primary">AquaLux Showers</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Banhos mais confortáveis com design sofisticado, ducha de mão e soluções práticas para o seu banheiro.</p><p className="mt-6 border-t pt-5 text-xs leading-5 text-muted-foreground">Preços, promoções e condições de frete estão sujeitos à confirmação na compra. As imagens são ilustrativas. CNPJ informado no site anterior: 33.655.444/0001-26. © 2026 AquaLux Showers.</p></div></footer>

    {menuOpen && <div className="fixed inset-0 z-50"><div className="drawer-shade absolute inset-0" onClick={() => setMenuOpen(false)} /><aside className="absolute inset-y-0 left-0 w-[min(85vw,330px)] bg-background p-5 shadow-xl"><div className="mb-8 flex items-center justify-between"><strong className="text-lg text-primary">AquaLux Showers</strong><Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X /></Button></div><nav className="flex flex-col gap-1">{[["Produto", "#inicio"], ["Descrição", "#descricao"], ["Avaliações", "#avaliacoes"], ["Newsletter", "#newsletter"]].map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} className="border-b py-4 font-medium">{label}</a>)}</nav></aside></div>}

    {cartOpen && <div className="fixed inset-0 z-50"><div className="drawer-shade absolute inset-0" onClick={() => setCartOpen(false)} /><aside role="dialog" aria-modal="true" aria-label="Carrinho de compras" className="absolute inset-y-0 right-0 flex w-[min(100vw,430px)] flex-col bg-background shadow-xl"><div className="flex items-center justify-between border-b px-5 py-4"><h2 className="text-lg font-bold">Meu Carrinho ({quantity})</h2><Button variant="ghost" size="icon" aria-label="Fechar carrinho" onClick={() => setCartOpen(false)}><X /></Button></div>{quantity === 0 ? <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center"><ShoppingCart className="size-12 text-muted-foreground" /><p>Seu carrinho está vazio.</p><Button onClick={() => setCartOpen(false)}>Continuar comprando</Button></div> : <><div className="flex-1 overflow-auto p-5"><div className="flex gap-4"><img src={photo0.url} alt="Chuveiro AquaLux Showers" className="size-24 shrink-0 rounded-md border object-cover" /><div className="min-w-0"><p className="text-sm font-semibold leading-5">{productName}</p><p className="mt-2 font-bold text-success">R$ 65,67</p><div className="mt-3 flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Diminuir quantidade" onClick={() => setQuantity((value) => Math.max(0, value - 1))}><Minus /></Button><span className="w-6 text-center">{quantity}</span><Button variant="outline" size="icon" aria-label="Aumentar quantidade" onClick={() => setQuantity((value) => value + 1)}><Plus /></Button><Button variant="ghost" size="icon" aria-label="Remover produto" title="Remover produto" onClick={() => setQuantity(0)}><Trash2 /></Button></div></div></div></div><div className="border-t p-5"><div className="mb-4 flex justify-between text-lg font-bold"><span>TOTAL</span><span className="text-primary">{money(quantity * 65.67)}</span></div><div className="mb-4 flex items-center gap-2 rounded-md bg-muted p-3 text-sm"><Truck className="size-5 shrink-0 text-success" /><span><strong>Frete Grátis no PIX</strong><br />Consulte as condições de entrega.</span></div><Button disabled className="h-12 w-full font-bold">Finalizar Compra</Button><p className="mt-2 text-center text-xs text-muted-foreground">Finalização de compra ainda não disponível.</p></div></>}</aside></div>}
  </div>;
}