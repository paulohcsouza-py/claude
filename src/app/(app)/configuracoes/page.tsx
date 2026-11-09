import { Cartao, TituloPagina } from "@/components/ui/cartao";
import { exigirAdmin, nomePapel, type Papel } from "@/lib/auth";
import { formatarDataHora } from "@/lib/formatar";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FormMembro } from "./form-membro";

export const metadata = { title: "Configurações" };

const NOMES_TABELAS: Record<string, string> = {
  perfis: "Equipe",
  configuracoes: "Configurações",
};

const NOMES_ACOES: Record<string, string> = {
  INSERT: "criou",
  UPDATE: "alterou",
  DELETE: "excluiu",
};

export default async function Configuracoes() {
  const usuario = await exigirAdmin();
  const supabase = await criarClienteServidor();

  const [{ data: equipe }, { data: auditoria }] = await Promise.all([
    supabase.from("perfis").select("id, nome, email, papel, ativo").order("nome"),
    supabase
      .from("audit_log")
      .select("id, tabela, registro_id, acao, usuario_nome, criado_em")
      .order("id", { ascending: false })
      .limit(30),
  ]);

  return (
    <>
      <TituloPagina titulo="Configurações" subtitulo="Somente a administradora acessa esta área." />

      <section className="space-y-3">
        <h2 className="text-2xl text-marsala-800">Equipe</h2>
        <p className="text-sm text-tinta-suave">
          Para criar um novo acesso, siga o passo a passo do guia de configuração (Supabase → Authentication → Add user).
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
          {(equipe ?? []).map((m) => (
            <Cartao key={m.id} className="space-y-3">
              <div>
                <p className="font-medium">
                  {m.nome}{" "}
                  {!m.ativo ? (
                    <span className="ml-1 rounded-full bg-nude-100 px-2 py-0.5 text-xs text-tinta-suave">inativo</span>
                  ) : null}
                </p>
                <p className="text-sm text-tinta-suave">
                  {m.email} · {nomePapel(m.papel as Papel)}
                </p>
              </div>
              <FormMembro id={m.id} papel={m.papel as Papel} ativo={m.ativo} eVoce={m.id === usuario.id} />
            </Cartao>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl text-marsala-800">Registro de atividades</h2>
        <p className="text-sm text-tinta-suave">Últimas 30 alterações feitas no sistema.</p>
        <Cartao className="p-0">
          {auditoria && auditoria.length > 0 ? (
            <ul className="divide-y divide-linha">
              {auditoria.map((a) => (
                <li key={a.id} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[15px]">
                    <strong className="font-medium">{a.usuario_nome ?? "Sistema"}</strong>{" "}
                    {NOMES_ACOES[a.acao] ?? a.acao} um registro em{" "}
                    <span className="text-marsala-700">{NOMES_TABELAS[a.tabela] ?? a.tabela}</span>
                  </span>
                  <span className="text-sm text-tinta-suave">{formatarDataHora(a.criado_em)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-tinta-suave">Nenhuma atividade registrada ainda.</p>
          )}
        </Cartao>
      </section>
    </>
  );
}
