import { EmConstrucao } from "@/components/em-construcao";

export const metadata = { title: "Relatórios" };

export default function Pagina() {
  return (
    <EmConstrucao
      titulo="Relatórios"
      fase={6}
      itens={["Vendas por período, canal, categoria e cliente", "Curva ABC, peças paradas e giro de estoque", "Exportação em Excel/CSV e PDF"]}
    />
  );
}
