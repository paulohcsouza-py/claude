// Testes de permissão contra o Supabase LOCAL (npx supabase start).
// Rodar: npm run test:banco
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

// As chaves do banco LOCAL vêm do `supabase status` (nunca ficam no código).
function chavesLocais() {
  if (process.env.SUPABASE_TEST_SECRET_KEY) {
    return {
      API_URL: process.env.SUPABASE_TEST_URL ?? "http://127.0.0.1:54321",
      PUBLISHABLE_KEY: process.env.SUPABASE_TEST_PUBLISHABLE_KEY,
      SECRET_KEY: process.env.SUPABASE_TEST_SECRET_KEY,
    };
  }
  const bin = process.env.SUPABASE_BIN ?? "npx --yes supabase";
  return JSON.parse(execSync(`${bin} status -o json`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
}

const { API_URL: URL, PUBLISHABLE_KEY: PUB, SECRET_KEY: SECRET } = chavesLocais();
const SENHA = "senha-teste-123";

const admin = createClient(URL, SECRET, { auth: { persistSession: false } });
const sufixo = Date.now();
const emails = { josi: `josi.${sufixo}@teste.local`, paulo: `paulo.${sufixo}@teste.local` };

async function entrar(email) {
  const c = createClient(URL, PUB, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: SENHA });
  assert.ifError(error);
  return c;
}

let josi, paulo, idJosi, idPaulo;

before(async () => {
  for (const [k, email] of Object.entries(emails)) {
    const { data, error } = await admin.auth.admin.createUser({
      email, password: SENHA, email_confirm: true, user_metadata: { nome: k },
    });
    assert.ifError(error);
    if (k === "josi") idJosi = data.user.id; else idPaulo = data.user.id;
  }
  // Em banco já usado, o primeiro usuário pode não ser este: garante os papéis.
  await admin.from("perfis").update({ papel: "admin" }).eq("id", idJosi);
  josi = await entrar(emails.josi);
  paulo = await entrar(emails.paulo);
});

test("visitante sem login não lê nada", async () => {
  const anon = createClient(URL, PUB, { auth: { persistSession: false } });
  const { data } = await anon.from("perfis").select("id");
  assert.equal((data ?? []).length, 0);
  const cfg = await anon.from("configuracoes").select("chave");
  assert.equal((cfg.data ?? []).length, 0);
});

test("perfil é criado automaticamente com o papel correto", async () => {
  const { data } = await admin.from("perfis").select("papel").eq("id", idPaulo).single();
  assert.equal(data.papel, "operador");
});

test("operador lê configurações, mas não altera", async () => {
  const { data } = await paulo.from("configuracoes").select("chave");
  assert.ok(data.length >= 1);
  const { data: alterados } = await paulo
    .from("configuracoes").update({ valor: 1 }).eq("chave", "dias_peca_parada").select();
  assert.equal(alterados.length, 0, "operador não deveria alterar configurações");
  const { error } = await paulo.from("configuracoes").insert({ chave: "x", valor: 1 });
  assert.ok(error, "operador não deveria inserir configurações");
});

test("operador não exclui registros", async () => {
  const { data } = await paulo.from("configuracoes").delete().eq("chave", "dias_peca_parada").select();
  assert.equal((data ?? []).length, 0);
});

test("operador não muda o próprio papel nem o de outros", async () => {
  const { data } = await paulo.from("perfis").update({ papel: "admin" }).eq("id", idPaulo).select();
  assert.equal(data.length, 0);
  const { data: d2 } = await paulo.from("perfis").update({ ativo: false }).eq("id", idJosi).select();
  assert.equal(d2.length, 0);
});

test("operador não vê o log de auditoria; admin vê", async () => {
  const { data } = await paulo.from("audit_log").select("id");
  assert.equal(data.length, 0);
  const { data: d2 } = await josi.from("audit_log").select("id").limit(1);
  assert.ok(d2.length >= 1);
});

test("admin altera configuração e a auditoria registra quem fez", async () => {
  const { data, error } = await josi
    .from("configuracoes").update({ valor: 120 }).eq("chave", "dias_peca_parada").select();
  assert.ifError(error);
  assert.equal(data.length, 1);
  const { data: log } = await josi.from("audit_log")
    .select("acao, usuario_nome, dados_antes, dados_depois")
    .eq("tabela", "configuracoes").eq("registro_id", "dias_peca_parada")
    .order("id", { ascending: false }).limit(1).single();
  assert.equal(log.acao, "UPDATE");
  assert.equal(log.usuario_nome, "josi");
  assert.equal(log.dados_depois.valor, 120);
  await josi.from("configuracoes").update({ valor: 90 }).eq("chave", "dias_peca_parada");
});

test("admin não consegue rebaixar/desativar a si mesma", async () => {
  const { error } = await josi.from("perfis").update({ papel: "operador" }).eq("id", idJosi);
  assert.ok(error);
  assert.match(error.message, /próprio papel/);
});

test("admin desativa operador e ele perde o acesso", async () => {
  const { error } = await josi.from("perfis").update({ ativo: false }).eq("id", idPaulo);
  assert.ifError(error);
  const { data } = await paulo.from("configuracoes").select("chave");
  assert.equal(data.length, 0, "usuário inativo não deveria ler nada");
  const { data: proprio } = await paulo.from("perfis").select("ativo").eq("id", idPaulo).single();
  assert.equal(proprio.ativo, false, "usuário inativo vê o próprio status");
  await josi.from("perfis").update({ ativo: true }).eq("id", idPaulo);
});

test("ninguém altera o log de auditoria", async () => {
  const { data } = await josi.from("audit_log").delete().gt("id", 0).select();
  assert.equal((data ?? []).length, 0);
});

test("cada usuário altera o próprio nome pela função segura", async () => {
  const { error } = await paulo.rpc("atualizar_meu_nome", { p_nome: "Paulo H." });
  assert.ifError(error);
  const { data } = await admin.from("perfis").select("nome").eq("id", idPaulo).single();
  assert.equal(data.nome, "Paulo H.");
});
