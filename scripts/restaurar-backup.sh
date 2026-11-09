#!/usr/bin/env bash
# =====================================================================
# Restaura um backup gerado por scripts/backup-banco.sh em um projeto
# Supabase NOVO (vazio).
#
# Passos:
#   1. descriptografa e confere o arquivo;
#   2. recria a estrutura do banco na versão em que o backup foi feito;
#   3. carrega os logins (auth) e os dados do sistema (public);
#   4. aplica migrações mais novas, se existirem;
#   5. confere a quantidade de registros com a do backup.
#
# Variáveis obrigatórias:
#   RESTAURAR_DB_URL  conexão "Session pooler" do projeto de DESTINO
#   BACKUP_SENHA      a mesma senha usada no backup
# Opcional:
#   SUPABASE_BIN      comando do Supabase CLI (padrão: supabase)
# Uso: scripts/restaurar-backup.sh caminho/do/backup.tar.gz.gpg
# Precisa ser executado de dentro do repositório (com histórico do git).
# =====================================================================
set -euo pipefail

ARQUIVO="${1:?Informe o arquivo .tar.gz.gpg}"
: "${RESTAURAR_DB_URL:?Defina RESTAURAR_DB_URL}"
: "${BACKUP_SENHA:?Defina BACKUP_SENHA}"
SUPABASE_BIN="${SUPABASE_BIN:-supabase}"
REPO="$(git rev-parse --show-toplevel)"

TRAB="$(mktemp -d)"
trap 'rm -rf "$TRAB"' EXIT

echo "→ Descriptografando…"
gpg --batch --yes --pinentry-mode loopback --passphrase "$BACKUP_SENHA" \
  -d -o "$TRAB/backup.tar.gz" "$ARQUIVO"
tar -C "$TRAB" -xzf "$TRAB/backup.tar.gz"
PASTA="$(find "$TRAB" -mindepth 1 -maxdepth 1 -type d -name 'backup-josi-correa_*' | head -1)"
[ -n "$PASTA" ] || { echo "✗ Arquivo de backup inválido."; exit 1; }
cat "$PASTA/manifesto.txt"

echo "→ Conferindo se o banco de destino está vazio…"
USUARIOS=$(psql "$RESTAURAR_DB_URL" -Atc "select count(*) from auth.users")
TEM_PERFIS=$(psql "$RESTAURAR_DB_URL" -Atc "select to_regclass('public.perfis') is not null")
if [ "$USUARIOS" != "0" ] || [ "$TEM_PERFIS" = "t" ]; then
  echo "✗ O banco de destino NÃO está vazio (usuários: $USUARIOS, tabelas do sistema: $TEM_PERFIS)."
  echo "  Por segurança, a restauração só é feita em um projeto Supabase novo."
  exit 1
fi

COMMIT="$(sed -n 's/^commit=//p' "$PASTA/manifesto.txt")"
echo "→ Recriando a estrutura na versão do backup (commit ${COMMIT:0:7})…"
mkdir -p "$TRAB/versao_backup"
if git -C "$REPO" cat-file -e "${COMMIT}^{commit}" 2>/dev/null; then
  git -C "$REPO" archive "$COMMIT" supabase | tar -x -C "$TRAB/versao_backup"
else
  echo "  (commit do backup não encontrado no histórico; usando as migrações atuais)"
  cp -r "$REPO/supabase" "$TRAB/versao_backup/"
fi
# Mantém só as migrações que estavam aplicadas quando o backup foi feito
if [ -s "$PASTA/migracoes.txt" ] && ! grep -q "não encontrada" "$PASTA/migracoes.txt"; then
  for f in "$TRAB/versao_backup/supabase/migrations/"*.sql; do
    v="$(basename "$f" | cut -d_ -f1)"
    grep -qx "$v" "$PASTA/migracoes.txt" || rm -f "$f"
  done
fi
$SUPABASE_BIN db push --remote="$RESTAURAR_DB_URL" --workdir "$TRAB/versao_backup" --include-all --yes

echo "→ Carregando logins e dados…"
# As migrações criam registros iniciais (ex.: configurações padrão); eles são
# substituídos pelos dados do backup. O banco foi conferido como novo acima.
cat > "$TRAB/limpar.sql" <<'SQL'
do $$
declare v_tabelas text;
begin
  select string_agg(format('public.%I', c.relname), ', ')
    into v_tabelas
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r';
  if v_tabelas is not null then
    execute 'truncate ' || v_tabelas || ' restart identity cascade';
  end if;
end $$;
SQL
psql "$RESTAURAR_DB_URL" -v ON_ERROR_STOP=1 --single-transaction \
  -c "set session_replication_role = replica" \
  -f "$TRAB/limpar.sql" \
  -f "$PASTA/dados_auth.sql" \
  -f "$PASTA/dados_public.sql"

echo "→ Aplicando migrações mais novas (se houver)…"
$SUPABASE_BIN db push --remote="$RESTAURAR_DB_URL" --workdir "$REPO" --include-all --yes

echo "→ Conferindo quantidades…"
ERROS=0
while IFS=';' read -r tabela esperado; do
  [ -z "$tabela" ] && continue
  atual=$(psql "$RESTAURAR_DB_URL" -Atc "select count(*) from $tabela" </dev/null 2>/dev/null || echo "ERRO")
  if [ "$atual" = "$esperado" ]; then
    echo "  ✓ $tabela: $atual"
  else
    echo "  ✗ $tabela: esperado $esperado, encontrado $atual"
    ERROS=$((ERROS + 1))
  fi
done < "$PASTA/contagens.csv"

if [ "$ERROS" -gt 0 ]; then
  echo "✗ Restauração concluída com $ERROS divergência(s). Verifique antes de usar."
  exit 1
fi
echo "✓ Restauração concluída e conferida."
