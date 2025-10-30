# Billing Dashboard (Next.js + BigQuery)

Dashboard similar ao gráfico do Google Cloud Billing, rodando **no seu sistema**.

## 🚀 Como rodar

1) Crie uma Service Account com papel **BigQuery Data Viewer** e baixe o JSON.
2) Coloque o arquivo na raiz do projeto como `service-account.json` (adicione ao .gitignore).
3) Copie `.env.example` para `.env.local` e preencha:
   - `GCP_PROJECT_ID`
   - `BQ_TABLE_PATH` (ex.: `meu-projeto.billing.gcp_billing_export_v1_XXXX`)
   - Ajuste `BQ_DATE_FIELD`, `BQ_COST_FIELD` e `BQ_PROJECT_FIELD` se sua tabela tiver nomes diferentes.

4) Instale deps e inicie:
```bash
npm install
npm run dev
# ou
pnpm install
pnpm dev
```

## Endpoints

- `GET /api/billing/daily?start=YYYY-MM-DD&end=YYYY-MM-DD&project=ProjetoA`
  - Retorna [{ date: '2025-10-17', cost: 123.45 }].

## Notas
- O toggle **Acumulado** é calculado no front.
- O formato de moeda é `pt-BR` com `BRL`.
