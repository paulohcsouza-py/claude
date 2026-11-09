import { EmConstrucao } from "@/components/em-construcao";

export const metadata = { title: "Vender" };

export default function Pagina() {
  return (
    <EmConstrucao
      titulo="Vender"
      fase={3}
      itens={["Tela de venda rápida com leitura de código de barras", "Pix, dinheiro e crediário, com pagamento dividido", "Recibo para enviar pelo WhatsApp"]}
    />
  );
}
