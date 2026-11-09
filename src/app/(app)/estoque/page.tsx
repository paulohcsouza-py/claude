import { EmConstrucao } from "@/components/em-construcao";

export const metadata = { title: "Estoque" };

export default function Pagina() {
  return (
    <EmConstrucao
      titulo="Estoque"
      fase={2}
      itens={["Produtos com variações de cor e tamanho", "Entradas, ajustes e histórico de movimentações", "Etiquetas com código de barras em PDF", "Importação por planilha"]}
    />
  );
}
