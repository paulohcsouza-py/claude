"use client";
import { useActionState } from "react";
import { Botao } from "@/components/ui/botao";
import { atualizarMembro, type EstadoAcao } from "./actions";

export function FormMembro({
  id,
  papel,
  ativo,
  eVoce,
}: {
  id: string;
  papel: "admin" | "operador";
  ativo: boolean;
  eVoce: boolean;
}) {
  const [estado, acao, salvando] = useActionState<EstadoAcao, FormData>(atualizarMembro, {});

  if (eVoce) {
    return <p className="text-sm text-tinta-suave">Este é o seu usuário.</p>;
  }

  return (
    <form action={acao} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`papel-${id}`}>Papel</label>
      <select
        id={`papel-${id}`}
        name="papel"
        defaultValue={papel}
        className="h-11 rounded-xl border border-linha bg-white px-3 text-[15px]"
      >
        <option value="operador">Operador</option>
        <option value="admin">Administradora</option>
      </select>
      <label className="flex h-11 items-center gap-2 text-[15px]">
        <input type="checkbox" name="ativo" defaultChecked={ativo} className="size-5 accent-marsala-700" />
        Ativo
      </label>
      <Botao type="submit" variante="secundario" disabled={salvando}>
        {salvando ? "Salvando…" : "Salvar"}
      </Botao>
      {estado.erro ? <p className="w-full text-sm text-red-700">{estado.erro}</p> : null}
      {estado.ok ? <p className="w-full text-sm text-emerald-700">{estado.ok}</p> : null}
    </form>
  );
}
