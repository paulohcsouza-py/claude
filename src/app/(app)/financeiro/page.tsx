import { EmConstrucao } from "@/components/em-construcao";

export const metadata = { title: "Financeiro" };

export default function Pagina() {
  return (
    <EmConstrucao
      titulo="Financeiro"
      fase={5}
      itens={["Contas a pagar e a receber", "Fluxo de caixa diário e mensal", "DRE simplificado"]}
    />
  );
}
