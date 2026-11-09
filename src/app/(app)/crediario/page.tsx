import { EmConstrucao } from "@/components/em-construcao";

export const metadata = { title: "Crediário" };

export default function Pagina() {
  return (
    <EmConstrucao
      titulo="Crediário"
      fase={4}
      itens={["Parcelas, vencimentos e recebimentos parciais", "Limite de crédito e alerta de inadimplência", "Cobrança pronta pelo WhatsApp"]}
    />
  );
}
