"use client";
import { useActionState } from "react";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { Aviso } from "@/components/ui/cartao";
import { trocarNome, trocarSenha, type EstadoConta } from "./actions";

export function FormNome({ nome }: { nome: string }) {
  const [estado, acao, salvando] = useActionState<EstadoConta, FormData>(trocarNome, {});
  return (
    <form action={acao} className="space-y-4">
      <Campo rotulo="Nome" name="nome" defaultValue={nome} required autoComplete="name" />
      {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}
      {estado.ok ? <Aviso tipo="sucesso">{estado.ok}</Aviso> : null}
      <Botao type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Salvar nome"}</Botao>
    </form>
  );
}

export function FormSenha() {
  const [estado, acao, salvando] = useActionState<EstadoConta, FormData>(trocarSenha, {});
  return (
    <form action={acao} className="space-y-4" key={estado.ok}>
      <Campo rotulo="Senha atual" name="senha_atual" type="password" required autoComplete="current-password" />
      <Campo
        rotulo="Nova senha"
        name="nova_senha"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        ajuda="Mínimo de 8 caracteres."
      />
      <Campo rotulo="Confirme a nova senha" name="confirmacao" type="password" required autoComplete="new-password" />
      {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}
      {estado.ok ? <Aviso tipo="sucesso">{estado.ok}</Aviso> : null}
      <Botao type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Trocar senha"}</Botao>
    </form>
  );
}
