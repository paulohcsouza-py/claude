import Link from "next/link";
import { Briefcase, HandCoins, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Cartao } from "@/components/ui/cartao";
import { obterUsuarioAtual } from "@/lib/auth";
import { formatarData, saudacao } from "@/lib/formatar";

export const metadata = { title: "Início" };

const atalhos = [
  { href: "/vendas", rotulo: "Nova venda", icone: ShoppingBag, destaque: true },
  { href: "/estoque", rotulo: "Estoque", icone: Package },
  { href: "/clientes", rotulo: "Clientes", icone: Users },
  { href: "/condicionais", rotulo: "Condicional", icone: Briefcase },
  { href: "/crediario", rotulo: "Crediário", icone: HandCoins },
  { href: "/relatorios", rotulo: "Relatórios", icone: TrendingUp },
];

const indicadores = ["Vendas de hoje", "Vendas do mês", "Ticket médio", "Condicionais abertas"];

export default async function Inicio() {
  const usuario = await obterUsuarioAtual();
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <>
      <header className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-dourado-500">{formatarData(new Date())}</p>
        <h1 className="mt-1 text-3xl text-marsala-800 lg:text-4xl">
          {saudacao()}, {primeiroNome}
        </h1>
      </header>

      <section aria-label="Atalhos" className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {atalhos.map(({ href, rotulo, icone: Icone, destaque }) => (
          <Link
            key={href}
            href={href}
            className={
              destaque
                ? "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-marsala-700 text-sm font-medium text-white shadow-suave hover:bg-marsala-800"
                : "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-linha bg-white text-sm font-medium text-tinta shadow-suave hover:border-marsala-200"
            }
          >
            <Icone className={destaque ? "size-7 text-dourado-200" : "size-7 text-marsala-600"} aria-hidden />
            {rotulo}
          </Link>
        ))}
      </section>

      <section aria-label="Indicadores" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {indicadores.map((rotulo) => (
          <Cartao key={rotulo} className="p-4">
            <p className="text-sm text-tinta-suave">{rotulo}</p>
            <p className="mt-2 font-serif text-3xl text-marsala-200">—</p>
          </Cartao>
        ))}
      </section>
      <p className="mt-3 text-sm text-tinta-suave">
        Os indicadores começam a aparecer conforme as vendas forem registradas (fases 3 e 6).
      </p>
    </>
  );
}
