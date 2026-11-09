-- =====================================================================
-- Fase 1 — Base: usuários, papéis, configurações e auditoria
-- Josi Corrêa Boutique — Sistema de Gestão
-- =====================================================================
-- Regras:
--   * admin    (Josi)  : acesso total, inclusive configurações e exclusões
--   * operador (Paulo) : acesso a tudo, exceto configurações e exclusões
--   * Usuário inativo não acessa nada.
--   * Toda alteração relevante fica registrada em audit_log.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.papel_usuario as enum ('admin', 'operador');

-- ---------------------------------------------------------------------
-- Perfis (1:1 com auth.users)
-- ---------------------------------------------------------------------
create table public.perfis (
  id             uuid primary key references auth.users (id) on delete cascade,
  nome           text not null,
  email          text not null,
  papel          public.papel_usuario not null default 'operador',
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

comment on table public.perfis is 'Usuários do sistema e seus papéis (admin/operador).';

-- ---------------------------------------------------------------------
-- Funções auxiliares de permissão
-- (security definer para poderem ler perfis sem esbarrar no RLS)
-- ---------------------------------------------------------------------
create or replace function public.usuario_ativo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis p
    where p.id = auth.uid() and p.ativo
  );
$$;

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis p
    where p.id = auth.uid() and p.ativo and p.papel = 'admin'
  );
$$;

-- Data/hora "agora" e "hoje" no fuso da loja
create or replace function public.agora_sp()
returns timestamp
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Sao_Paulo');
$$;

create or replace function public.hoje_sp()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Sao_Paulo')::date;
$$;

-- Atualiza a coluna atualizado_em automaticamente
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.tocar_atualizado_em();

-- ---------------------------------------------------------------------
-- Criação automática do perfil quando um usuário é criado no Supabase.
-- O PRIMEIRO usuário criado vira admin; os demais, operador.
-- ---------------------------------------------------------------------
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_papel public.papel_usuario;
  v_nome  text;
begin
  if exists (select 1 from public.perfis) then
    v_papel := 'operador';
  else
    v_papel := 'admin';
  end if;

  v_nome := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    initcap(split_part(new.email, '@', 1))
  );

  insert into public.perfis (id, nome, email, papel)
  values (new.id, v_nome, coalesce(new.email, ''), v_papel);

  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- Mantém o e-mail do perfil igual ao do login
create or replace function public.sincronizar_email_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.perfis set email = coalesce(new.email, '') where id = new.id;
  end if;
  return new;
end;
$$;

create trigger ao_alterar_email_usuario
  after update of email on auth.users
  for each row execute function public.sincronizar_email_perfil();

-- Garante que sempre exista ao menos um admin ativo
create or replace function public.garantir_admin_ativo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.perfis where papel = 'admin' and ativo
  ) then
    raise exception 'O sistema precisa de pelo menos uma administradora ativa.'
      using errcode = 'P0001';
  end if;
  return null;
end;
$$;

create constraint trigger perfis_sempre_um_admin
  after update or delete on public.perfis
  deferrable initially deferred
  for each row execute function public.garantir_admin_ativo();

-- Impede que um usuário altere o próprio papel/status (mesmo sendo admin),
-- evitando que a única admin se rebaixe por engano.
create or replace function public.proteger_proprio_perfil()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and new.id = auth.uid()
     and (new.papel is distinct from old.papel or new.ativo is distinct from old.ativo) then
    raise exception 'Você não pode alterar o seu próprio papel ou status.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger perfis_proteger_proprio
  before update on public.perfis
  for each row execute function public.proteger_proprio_perfil();

-- Cada usuário pode alterar apenas o próprio nome
create or replace function public.atualizar_meu_nome(p_nome text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.usuario_ativo() then
    raise exception 'Acesso negado.' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_nome, ''))) < 2 then
    raise exception 'Informe o nome.' using errcode = 'P0001';
  end if;
  update public.perfis set nome = trim(p_nome) where id = auth.uid();
end;
$$;

revoke execute on function public.atualizar_meu_nome(text) from public, anon;
grant execute on function public.atualizar_meu_nome(text) to authenticated;

-- ---------------------------------------------------------------------
-- Configurações (chave/valor) — somente admin altera
-- ---------------------------------------------------------------------
create table public.configuracoes (
  chave          text primary key,
  valor          jsonb not null,
  descricao      text,
  atualizado_em  timestamptz not null default now(),
  atualizado_por uuid references public.perfis (id)
);

create trigger configuracoes_atualizado_em
  before update on public.configuracoes
  for each row execute function public.tocar_atualizado_em();

insert into public.configuracoes (chave, valor, descricao) values
  ('loja', jsonb_build_object(
      'nome', 'Josi Corrêa Boutique',
      'cidade', 'Joinville/SC',
      'whatsapp', ''
    ), 'Dados da loja exibidos em recibos e mensagens'),
  ('dias_peca_parada', '90'::jsonb, 'Dias sem venda para considerar uma peça parada');

-- ---------------------------------------------------------------------
-- Log de auditoria (somente leitura; preenchido por trigger)
-- ---------------------------------------------------------------------
create table public.audit_log (
  id            bigint generated always as identity primary key,
  tabela        text not null,
  registro_id   text,
  acao          text not null check (acao in ('INSERT', 'UPDATE', 'DELETE')),
  usuario_id    uuid,
  usuario_nome  text,
  dados_antes   jsonb,
  dados_depois  jsonb,
  criado_em     timestamptz not null default now()
);

create index audit_log_tabela_registro_idx on public.audit_log (tabela, registro_id);
create index audit_log_criado_em_idx on public.audit_log (criado_em desc);
create index audit_log_usuario_idx on public.audit_log (usuario_id);

comment on table public.audit_log is 'Quem fez o quê e quando. Registros nunca são alterados.';

create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_nome  text;
  v_antes jsonb;
  v_depois jsonb;
  v_id    text;
begin
  if v_uid is not null then
    select nome into v_nome from public.perfis where id = v_uid;
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    v_antes := to_jsonb(old);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    v_depois := to_jsonb(new);
  end if;

  -- Ignora UPDATE que não mudou nada além de atualizado_em
  if tg_op = 'UPDATE'
     and (v_antes - 'atualizado_em') = (v_depois - 'atualizado_em') then
    return new;
  end if;

  v_id := coalesce(v_depois ->> 'id', v_antes ->> 'id',
                   v_depois ->> 'chave', v_antes ->> 'chave');

  insert into public.audit_log
    (tabela, registro_id, acao, usuario_id, usuario_nome, dados_antes, dados_depois)
  values
    (tg_table_name, v_id, tg_op, v_uid, v_nome, v_antes, v_depois);

  return coalesce(new, old);
end;
$$;

create trigger auditoria_perfis
  after insert or update or delete on public.perfis
  for each row execute function public.registrar_auditoria();

create trigger auditoria_configuracoes
  after insert or update or delete on public.configuracoes
  for each row execute function public.registrar_auditoria();

-- ---------------------------------------------------------------------
-- Segurança em nível de linha (RLS)
-- Padrão do sistema daqui em diante:
--   SELECT/INSERT/UPDATE -> usuario_ativo()
--   DELETE               -> eh_admin()
-- ---------------------------------------------------------------------
alter table public.perfis        enable row level security;
alter table public.configuracoes enable row level security;
alter table public.audit_log     enable row level security;

-- Perfis: todos os usuários ativos veem a equipe; só admin altera.
create policy "perfis: ativos leem" on public.perfis
  for select to authenticated
  using (public.usuario_ativo() or id = auth.uid());

create policy "perfis: admin altera" on public.perfis
  for update to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

-- (inserção de perfis acontece só pelo trigger; exclusão, pela exclusão do login)

-- Configurações: todos leem; só admin grava/exclui.
create policy "configuracoes: ativos leem" on public.configuracoes
  for select to authenticated
  using (public.usuario_ativo());

create policy "configuracoes: admin insere" on public.configuracoes
  for insert to authenticated
  with check (public.eh_admin());

create policy "configuracoes: admin altera" on public.configuracoes
  for update to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

create policy "configuracoes: admin exclui" on public.configuracoes
  for delete to authenticated
  using (public.eh_admin());

-- Auditoria: só admin consulta; ninguém altera pela aplicação.
create policy "audit_log: admin le" on public.audit_log
  for select to authenticated
  using (public.eh_admin());

-- ---------------------------------------------------------------------
-- Permissões de acesso: visitantes não autenticados (anon) não têm acesso.
-- ---------------------------------------------------------------------
revoke all on public.perfis, public.configuracoes, public.audit_log from anon;
revoke insert, delete on public.perfis from authenticated;
revoke insert, update, delete, truncate on public.audit_log from authenticated;

revoke execute on function public.criar_perfil_novo_usuario() from public, anon, authenticated;
revoke execute on function public.sincronizar_email_perfil() from public, anon, authenticated;
revoke execute on function public.registrar_auditoria() from public, anon, authenticated;
