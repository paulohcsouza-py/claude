"use server";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

export type EstadoLogin = { erro?: string; email?: string };

/** Aceita só caminhos internos (evita redirecionar para outro site). */
function destinoSeguro(valor: FormDataEntryValue | null): string {
  const v = typeof valor === "string" ? valor : "";
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/login") ? v : "/";
}

export async function entrar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Informe e-mail e senha.", email };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    const msg =
      error.code === "invalid_credentials"
        ? "E-mail ou senha incorretos."
        : error.code === "email_not_confirmed"
          ? "Este e-mail ainda não foi confirmado."
          : error.status === 429
            ? "Muitas tentativas. Aguarde alguns minutos e tente de novo."
            : "Não foi possível entrar agora. Verifique a internet e tente de novo.";
    return { erro: msg, email };
  }

  redirect(destinoSeguro(formData.get("voltar")));
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
