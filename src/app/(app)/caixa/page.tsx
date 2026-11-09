import { EmConstrucao } from "@/components/em-construcao";

export const metadata = { title: "Caixa" };

export default function Pagina() {
  return (
    <EmConstrucao
      titulo="Caixa"
      fase={3}
      itens={["Abertura, sangria e suprimento", "Fechamento com conferência por forma de pagamento"]}
    />
  );
}
