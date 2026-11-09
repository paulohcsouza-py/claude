import { EmConstrucao } from "@/components/em-construcao";

export const metadata = { title: "Clientes" };

export default function Pagina() {
  return (
    <EmConstrucao
      titulo="Clientes"
      fase={3}
      itens={["Cadastro com medidas e preferências", "Histórico de compras, condicionais e crediário", "Aniversariantes do mês e botão do WhatsApp"]}
    />
  );
}
