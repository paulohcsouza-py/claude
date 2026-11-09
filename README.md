# Josi Corrêa Boutique — Sistema de Gestão

Sistema web (celular e computador) para estoque, vendas, caixa, clientes,
condicional, crediário, financeiro, relatórios e integração com a Tray.

- **Guia de configuração (passo a passo):** [docs/CONFIGURACAO.md](docs/CONFIGURACAO.md)
- **Backup e restauração:** [docs/BACKUP.md](docs/BACKUP.md)

## Tecnologia

Next.js 16 + TypeScript + Tailwind · Supabase (Postgres, login, arquivos) · Netlify · PWA

## Para desenvolvedores

```bash
npm install
npx supabase start          # banco local (requer Docker)
cp .env.example .env.local  # preencha com os dados do `supabase start`
npm run dev                 # http://localhost:3000
npm run test:banco          # testes de permissão no banco local
npm run lint && npm run build
```

- Migrações do banco: `supabase/migrations/` (aplicadas automaticamente em produção
  pelo workflow **Aplicar migrações do banco**).
- Permissões ficam no banco (RLS): `usuario_ativo()` para ler/gravar, `eh_admin()` para excluir.
- Toda tabela de negócio deve receber o trigger `registrar_auditoria()`.
