import { Logo } from "@/components/marca/logo";
import { Cartao } from "@/components/ui/cartao";
import { Botao } from "@/components/ui/botao";
import { sair } from "../actions";

export default function AcessoBloqueado() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <Cartao className="w-full max-w-sm text-center">
        <Logo className="mb-6 items-center" />
        <h1 className="text-2xl text-marsala-800">Acesso desativado</h1>
        <p className="mt-2 text-tinta-suave">
          Seu usuário está desativado no sistema. Fale com a Josi para reativar.
        </p>
        <form action={sair} className="mt-6">
          <Botao variante="secundario" className="w-full">Sair</Botao>
        </form>
      </Cartao>
    </main>
  );
}
