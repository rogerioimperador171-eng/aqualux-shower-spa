# AquaLux Showers

Loja de página única (TanStack Start + React + Vite + TypeScript) com carrinho no navegador e checkout com pagamento via PIX pela API **FlevoPay**, hospedada na Netlify.

This project was built with [Lovable](https://lovable.dev). Alterações feitas no editor do Lovable são commitadas neste repositório e vice-versa.

## Como funciona o pagamento (FlevoPay)

| Peça | Arquivo |
| --- | --- |
| Checkout | `src/routes/checkout.tsx` (QR Code, Copia e Cola, polling a cada 3 s) |
| Gerar PIX | `netlify/functions/pix-create.mts` → `POST /api/v1/transaction` (valor em centavos calculado no servidor) |
| Status | `netlify/functions/pix-check.mts` → `GET /api/v1/check_status.php?hash=...` |
| Cliente da API | `netlify/lib/flevopay.mts` (preço, frete, timeouts) |
| Meta Pixel | `src/lib/pixel.ts` (PageView, AddToCart, InitiateCheckout, Purchase) |

Quando pago, se `FLEVOPAY_UPSELL_URL` existir o cliente é redirecionado para ela (com as UTMs da URL atual); senão vê "Pagamento aprovado!". A API Key e a URL de upsell nunca vão para o navegador.

## Variáveis de ambiente (Netlify → Project configuration → Environment variables)

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `FLEVOPAY_API_KEY` | sim | Chave secreta da FlevoPay (marque "Contains secret values"). |
| `FLEVOPAY_PRODUCT_HASH` | sim | Hash do produto na FlevoPay. |
| `FLEVOPAY_UPSELL_URL` | não | Página para onde o cliente vai após pagar. |
| `LOVABLE_ASSETS_ORIGIN` | não | Domínio das fotos. |

Depois de salvar, faça um novo deploy.

## Publicar na Netlify

O `netlify.toml` já está configurado (`bun run build`, publicação em `dist`, Node 22). Basta conectar o repositório na Netlify (ou fazer push na branch conectada). As Functions em `netlify/functions` e a edge function em `netlify/edge-functions` são publicadas automaticamente junto com o site.

## Testar localmente

```sh
npm i                      # ou: bun install
netlify link               # vincula ao projeto e baixa as variáveis de ambiente
netlify dev                # site + Functions em http://localhost:8888
```

Sem `netlify link`, crie um arquivo `.env` na raiz com `FLEVOPAY_API_KEY=...` e `FLEVOPAY_PRODUCT_HASH=...`; o `netlify dev` lê esse arquivo. O `.env` está no `.gitignore` e nunca deve ser commitado.

Para testar: adicione o produto ao carrinho → **Finalizar Compra** → preencha os dados (use um CPF válido) → endereço → **Pagar com Pix**. Se as credenciais estiverem ausentes ou a API falhar, aparece uma mensagem amigável e o botão **Tentar novamente**.

Teste direto das Functions:

```sh
curl -X POST http://localhost:8888/.netlify/functions/pix-create \
  -H "Content-Type: application/json" \
  -d '{"quantity":1,"shipping":"free","payerName":"Maria Silva","payerEmail":"maria@email.com","payerDocument":"52998224725","payerPhone":"11999999999"}'

curl -X POST http://localhost:8888/.netlify/functions/pix-check \
  -H "Content-Type: application/json" -d '{"transactionId":"ID_RETORNADO"}'
```

## Atualizar a API futuramente

- **URL base**: altere `BASE_URL` em `netlify/lib/flevopay.mts`.
- **Endpoints / campos enviados**: `netlify/functions/pix-create.mts` (transaction) e `netlify/functions/pix-check.mts` (check_status).
- **Campos da resposta**: a leitura de `transactionId`, `copyPaste`, `qrcodeUrl` e `status` aceita nomes alternativos; inclua novos nomes nos mesmos arquivos se a FlevoPay mudar o formato.
- **Status de pago**: a lista `PAID` em `netlify/functions/pix-check.mts` define quais status contam como pago (ex.: `paid`).
- **Preço e frete**: `UNIT_PRICE` e `SHIPPING_PRICES` em `netlify/lib/flevopay.mts` (mantenha iguais aos valores exibidos no site).
- **Timeouts**: 15 s para gerar o PIX e 10 s para consultar, em `pix-create.mts` / `pix-check.mts`.
