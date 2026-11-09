import { EmConstrucao } from "@/components/em-construcao";

export const metadata = { title: "Condicional" };

export default function Pagina() {
  return (
    <EmConstrucao
      titulo="Condicional"
      fase={4}
      itens={["Montar malinha com prazo de devolução", "Retorno: devolvido volta ao estoque, comprado vira venda", "Painel de condicionais abertas e atrasadas"]}
    />
  );
}
