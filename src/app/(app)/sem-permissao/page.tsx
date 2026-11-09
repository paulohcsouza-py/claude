import Link from "next/link";
import { Cartao } from "@/components/ui/cartao";
import { classesBotao } from "@/components/ui/botao";

export const metadata = { title: "Sem permissão" };

export default function SemPermissao() {
  return (
    <Cartao className="mx-auto mt-10 max-w-md text-center">
      <h1 className="text-2xl text-marsala-800">Área restrita</h1>
      <p className="mt-2 text-tinta-suave">Esta área é exclusiva da administradora.</p>
      <Link href="/" className={classesBotao("secundario", "md", "mt-6")}>
        Voltar ao início
      </Link>
    </Cartao>
  );
}
