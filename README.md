# AquaLux Showers

Loja de página única (TanStack Start + React + Vite + TypeScript) com carrinho no navegador e checkout com pagamento via PIX pela API **ProPix BR**, hospedada na Netlify.

This project was built with [Lovable](https://lovable.dev). Alterações feitas no editor do Lovable são commitadas neste repositório e vice-versa.

## Como funciona o pagamento

| Peça | Arquivo | Função |
| --- | --- | --- |
| Checkout (frontend) | `src/routes/checkout.tsx` | Chama as Netlify Functions, mostra QR Code, PIX Copia e Cola e faz o polling. |
| Gerar PIX | `netlify/functions/pix-create.mts` | `POST /api/v1/deposit` na ProPix. Calcula o valor no servidor (quantidade × preço + frete). |
| Consultar status | `netlify/functions/pix-check.mts` | `POST /api/v1/check` com o `transactionId`. |
| Cliente da API | `netlify/lib/propix.mts` | URL base, headers, timeout, tratamento de erros, preço e frete. |
| Fotos | `netlify/edge-functions/lovable-assets.ts` | Entrega na Netlify as fotos do Lovable Assets (`src/assets/*.asset.json`). |

Fluxo: o cliente clica em **Pagar com Pix** → `/.netlify/functions/pix-create` → a tela mostra QR Code, código copia e cola, botão **COPIAR PIX** e "Aguardando pagamento" → a cada 3 segundos `/.netlify/functions/pix-check` é consultada → quando `transactionState` for `COMPLETO`, a tela muda para "Pagamento aprovado!" sem recarregar.

O `x-client-secret` **nunca** vai para o navegador: só as Functions leem as credenciais, a partir de variáveis de ambiente.

O pagamento com cartão mostra o formulário (número, nome, validade e CVV), mas não processa cartões: ao finalizar, aparece um aviso de pagamento não aprovado com o botão para pagar com PIX. Os dados do cartão não são enviados a nenhum servidor nem armazenados.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `PROPAY_CLIENT_ID` | sim | Client ID da ProPix (`live_...`). |
| `PROPAY_CLIENT_SECRET` | sim | Client Secret da ProPix (`sk_...`). Marque como **secreta**. |
| `PROPAY_BASE_URL` | não | Padrão `https://api.propixbr.com`. |
| `LOVABLE_ASSETS_ORIGIN` | não | Domínio de onde as fotos são buscadas. Padrão `https://aqualux-shower-spa.lovable.app`. |

### Configurar na Netlify

1. Abra o projeto na Netlify → **Project configuration → Environment variables → Add a variable**.
2. Crie `PROPAY_CLIENT_ID` com o seu Client ID.
3. Crie `PROPAY_CLIENT_SECRET` com o seu Client Secret e marque **Contains secret values**. O escopo precisa incluir **Functions**.
4. Faça um novo deploy (**Deploys → Trigger deploy → Deploy site**) para as Functions lerem os novos valores.

Pela CLI (alternativa):

```sh
netlify env:set PROPAY_CLIENT_ID "seu_client_id"
netlify env:set PROPAY_CLIENT_SECRET "seu_client_secret" --secret
```

Nunca coloque as credenciais em arquivos do repositório nem em variáveis `VITE_*` (estas vão para o navegador).

### Alterar o Client ID e o Client Secret

Edite os valores de `PROPAY_CLIENT_ID` / `PROPAY_CLIENT_SECRET` em **Environment variables** e faça um novo deploy. Nenhum código precisa mudar.

## Publicar na Netlify

O `netlify.toml` já está configurado (`bun run build`, publicação em `dist`, Node 22). Basta conectar o repositório na Netlify (ou fazer push na branch conectada). As Functions em `netlify/functions` e a edge function em `netlify/edge-functions` são publicadas automaticamente junto com o site.

## Testar localmente

```sh
npm i                      # ou: bun install
netlify link               # vincula ao projeto e baixa as variáveis de ambiente
netlify dev                # site + Functions em http://localhost:8888
```

Sem `netlify link`, crie um arquivo `.env` na raiz com `PROPAY_CLIENT_ID=...` e `PROPAY_CLIENT_SECRET=...`; o `netlify dev` lê esse arquivo. O `.env` está no `.gitignore` e nunca deve ser commitado.

Para testar: adicione o produto ao carrinho → **Finalizar Compra** → preencha os dados (use um CPF válido) → endereço → **Pagar com Pix**. Se as credenciais estiverem ausentes ou a API falhar, aparece uma mensagem amigável e o botão **Tentar novamente**.

Teste direto das Functions:

```sh
curl -X POST http://localhost:8888/.netlify/functions/pix-create \
  -H "Content-Type: application/json" \
  -d '{"quantity":1,"shipping":"free","payerName":"Maria Silva","payerDocument":"52998224725"}'

curl -X POST http://localhost:8888/.netlify/functions/pix-check \
  -H "Content-Type: application/json" -d '{"transactionId":"ID_RETORNADO"}'
```

## Atualizar a API futuramente

- **URL base**: defina `PROPAY_BASE_URL` ou altere `BASE_URL` em `netlify/lib/propix.mts`.
- **Endpoints / campos enviados**: `netlify/functions/pix-create.mts` (deposit) e `netlify/functions/pix-check.mts` (check).
- **Campos da resposta**: a leitura de `transactionId`, `copyPaste`, `qrcodeUrl` e `status` aceita nomes alternativos; inclua novos nomes nos mesmos arquivos se a ProPix mudar o formato.
- **Status de pago**: o polling considera aprovado quando `transactionState` é `COMPLETO` (`src/routes/checkout.tsx`).
- **Preço e frete**: `UNIT_PRICE` e `SHIPPING_PRICES` em `netlify/lib/propix.mts` (mantenha iguais aos valores exibidos no site).
- **Timeouts**: 15 s para gerar o PIX e 10 s para consultar, em `pix-create.mts` / `pix-check.mts`.
