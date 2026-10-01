import { useEffect, useRef, useState } from "react";

const KEY = "aqualux-cart-qty";

export const PRICE = 65.67;
export const productName = "Chuveiro Luxo a Gás 60cm Banho Ducha Luxuosa e Chuveiro de mão 2 Saídas Instalação Padrão Hotel Ajustável";
export const money = (amount: number) => amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function read() {
  try {
    const n = Number(window.sessionStorage.getItem(KEY));
    return Number.isInteger(n) && n > 0 ? Math.min(n, 20) : 0;
  } catch { return 0; }
}

export function saveCart(quantity: number) {
  try { window.sessionStorage.setItem(KEY, String(Math.max(0, Math.min(quantity, 20)))); } catch { /* armazenamento indisponível */ }
}

/** Quantidade do carrinho mantida na sessão do navegador (sobrevive à ida e volta do checkout). */
export function useCartQuantity() {
  const [quantity, setQuantity] = useState(0);
  const loaded = useRef(false);
  useEffect(() => { setQuantity(read()); loaded.current = true; }, []);
  useEffect(() => { if (loaded.current) saveCart(quantity); }, [quantity]);
  return [quantity, setQuantity] as const;
}
