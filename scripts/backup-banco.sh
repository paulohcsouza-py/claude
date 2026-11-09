#!/usr/bin/env bash
# =====================================================================
# Backup do banco da Josi Corrêa Boutique (Supabase)
# Gera um arquivo criptografado: backup-josi-correa_AAAA-MM-DD_HHhMM.tar.gz.gpg
#
# Variáveis obrigatórias:
#   SUPABASE_DB_URL  conexão "Session pooler" do Supabase (postgresql://...)
#   BACKUP_SENHA     senha usada para criptografar o arquivo
# Uso: scripts/backup-banco.sh [pasta_destino]
# =====================================================================
set -euo pipefail

: "${SUPABASE_DB_URL:?Defina SUPABASE_DB_URL}"
: "${BACKUP_SENHA:?Defina BACKUP_SENHA}"

DESTINO="${1:-backups}"
CARIMBO="$(TZ=America/Sao_Paulo date +%Y-%m-%d_%Hh%M)"
NOME="backup-josi-correa_${CARIMBO}"
TRAB="$(mktemp -d)"
trap 'rm -rf "$TRAB"' EXIT
mkdir -p "$DESTINO" "$TRAB/$NOME"
cd_trab="$TRAB/$NOME"

echo "→ Versão do servidor:"
psql "$SUPABASE_DB_URL" -Atc "show server_version" | tee "$cd_trab/versao_servidor.txt"

COMUNS=(--no-owner --no-privileges --quote-all-identifiers)

echo "→ Estrutura (referência)…"
pg_dump "$SUPABASE_DB_URL" "${COMUNS[@]}" --schema-only --schema=public -f "$cd_trab/estrutura_public.sql"

echo "→ Dados de login (auth)…"
pg_dump "$SUPABASE_DB_URL" "${COMUNS[@]}" --data-only \
  --table=auth.users --table=auth.identities -f "$cd_trab/dados_auth.sql"

echo "→ Dados do sistema (public)…"
pg_dump "$SUPABASE_DB_URL" "${COMUNS[@]}" --data-only --schema=public -f "$cd_trab/dados_public.sql"

echo "→ Contagem de registros (para conferência na restauração)…"
psql "$SUPABASE_DB_URL" -At -F ';' -c "
  select 'auth.users', count(*) from auth.users
  union all
  select 'auth.identities', count(*) from auth.identities
  union all
  select format('public.%I', c.relname),
         (xpath('/row/n/text()', query_to_xml(format('select count(*) as n from public.%I', c.relname), false, true, '')))[1]::text::bigint
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
  order by 1" > "$cd_trab/contagens.csv"
cat "$cd_trab/contagens.csv"

echo "→ Migrações aplicadas…"
psql "$SUPABASE_DB_URL" -At -c "select version from supabase_migrations.schema_migrations order by 1" \
  > "$cd_trab/migracoes.txt" 2>/dev/null || echo "(tabela de migrações não encontrada)" > "$cd_trab/migracoes.txt"

{
  echo "data=$CARIMBO"
  echo "commit=${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo desconhecido)}"
} > "$cd_trab/manifesto.txt"

tar -C "$TRAB" -czf "$TRAB/$NOME.tar.gz" "$NOME"
gpg --batch --yes --pinentry-mode loopback --passphrase "$BACKUP_SENHA" \
  --symmetric --cipher-algo AES256 -o "$DESTINO/$NOME.tar.gz.gpg" "$TRAB/$NOME.tar.gz"

echo "✓ Backup gerado: $DESTINO/$NOME.tar.gz.gpg ($(du -h "$DESTINO/$NOME.tar.gz.gpg" | cut -f1))"
