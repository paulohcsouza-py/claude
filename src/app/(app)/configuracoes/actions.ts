"use server";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";

export type EstadoAcao = { erro?: string; ok?: string };

export async function atualizarMembro(_: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const papel = String(formData.get("papel") ?? "");
  const ativo = formData.get("ativo") === "on";

  if (!id || (papel !== "admin" && papel !== "operador")) {
    return { erro: "Dados inválidos." };
  }

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("perfis")
    .update({ papel, ativo })
    .eq("id", id)
    .select("nome")
    .maybeSingle();

  if (error) {
    return { erro: error.message.includes("próprio") || error.message.includes("administradora")
      ? error.message
      : "Não foi possível salvar. Tente novamente." };
  }
  if (!data) return { erro: "Usuário não encontrado." };

  revalidatePath("/configuracoes");
  return { ok: `Alterações de ${data.nome} salvas.` };
}
