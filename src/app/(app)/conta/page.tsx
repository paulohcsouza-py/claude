import { LogOut } from "lucide-react";
import { Botao } from "@/components/ui/botao";
import { Cartao, TituloPagina } from "@/components/ui/cartao";
import { nomePapel, obterUsuarioAtual } from "@/lib/auth";
import { sair } from "@/app/login/actions";
import { FormNome, FormSenha } from "./formularios";

export const metadata = { title: "Minha conta" };

export default async function MinhaConta() {
  const usuario = await obterUsuarioAtual();
  return (
    <>
      <TituloPagina titulo="Minha conta" subtitulo={`${usuario.email} · ${nomePapel(usuario.papel)}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao>
          <h2 className="mb-4 text-xl text-marsala-800">Dados</h2>
          <FormNome nome={usuario.nome} />
        </Cartao>
        <Cartao>
          <h2 className="mb-4 text-xl text-marsala-800">Trocar senha</h2>
          <FormSenha />
        </Cartao>
      </div>
      <form action={sair} className="mt-6 lg:hidden">
        <Botao variante="secundario" className="w-full">
          <LogOut className="size-5" aria-hidden /> Sair
        </Botao>
      </form>
    </>
  );
}
