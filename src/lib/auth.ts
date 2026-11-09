import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

export type Papel = "admin" | "operador";

export type UsuarioAtual = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
};

/**
 * Usuário logado + perfil. Redireciona para /login se não houver sessão
 * e para /acesso-bloqueado se o perfil estiver inativo ou ausente.
 * Memorizado por requisição (React cache).
 */
export const obterUsuarioAtual = cache(async (): Promise<UsuarioAtual> => {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, nome, email, papel, ativo")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil || !perfil.ativo) redirect("/login/bloqueado");

  return {
    id: perfil.id,
    nome: perfil.nome,
    email: perfil.email,
    papel: perfil.papel as Papel,
  };
});

/** Para páginas/ações exclusivas da administradora. */
export async function exigirAdmin(): Promise<UsuarioAtual> {
  const usuario = await obterUsuarioAtual();
  if (usuario.papel !== "admin") redirect("/sem-permissao");
  return usuario;
}

export function nomePapel(papel: Papel): string {
  return papel === "admin" ? "Administradora" : "Operador";
}
