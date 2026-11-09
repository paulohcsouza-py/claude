"use server";
import { revalidatePath } from "next/cache";
import { obterUsuarioAtual } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";

export type EstadoConta = { erro?: string; ok?: string };

export async function trocarSenha(_: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const usuario = await obterUsuarioAtual();
  const atual = String(formData.get("senha_atual") ?? "");
  const nova = String(formData.get("nova_senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (nova.length < 8) return { erro: "A nova senha precisa ter pelo menos 8 caracteres." };
  if (nova !== confirmacao) return { erro: "A confirmação não confere com a nova senha." };

  const supabase = await criarClienteServidor();

  // Confirma a senha atual antes de trocar
  const { error: erroLogin } = await supabase.auth.signInWithPassword({
    email: usuario.email,
    password: atual,
  });
  if (erroLogin) return { erro: "A senha atual está incorreta." };

  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) {
    return {
      erro:
        error.code === "same_password"
          ? "A nova senha deve ser diferente da atual."
          : error.code === "weak_password"
            ? "Senha muito fraca. Use letras e números."
            : "Não foi possível trocar a senha. Tente novamente.",
    };
  }
  return { ok: "Senha alterada com sucesso." };
}

export async function trocarNome(_: EstadoConta, formData: FormData): Promise<EstadoConta> {
  await obterUsuarioAtual();
  const nome = String(formData.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome." };

  // Atualização do próprio nome feita por função segura no banco
  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("atualizar_meu_nome", { p_nome: nome });
  if (error) return { erro: "Não foi possível salvar o nome." };
  revalidatePath("/", "layout");
  return { ok: `Nome atualizado para ${nome}.` };
}
