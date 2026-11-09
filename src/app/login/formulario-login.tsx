"use client";
import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { Aviso } from "@/components/ui/cartao";
import { entrar, type EstadoLogin } from "./actions";

export function FormularioLogin({ voltar }: { voltar?: string }) {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="voltar" value={voltar ?? "/"} />
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        required
        defaultValue={estado.email}
        placeholder="seu@email.com"
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
      />
      {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}
      <Botao type="submit" tamanho="lg" disabled={enviando} className="mt-2 w-full">
        <LogIn className="size-5" aria-hidden />
        {enviando ? "Entrando…" : "Entrar"}
      </Botao>
    </form>
  );
}
