import { Cartao, TituloPagina } from "@/components/ui/cartao";
import { Sparkles } from "lucide-react";

export function EmConstrucao({
  titulo,
  fase,
  itens,
}: {
  titulo: string;
  fase: number;
  itens: string[];
}) {
  return (
    <>
      <TituloPagina titulo={titulo} />
      <Cartao className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-dourado-100 text-dourado-600">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-tinta">Em construção</p>
            <p className="text-sm text-tinta-suave">Este módulo chega na fase {fase}.</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2 text-[15px] text-tinta-suave">
          {itens.map((i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-dourado-400" aria-hidden />
              {i}
            </li>
          ))}
        </ul>
      </Cartao>
    </>
  );
}
