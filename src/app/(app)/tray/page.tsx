import { EmConstrucao } from "@/components/em-construcao";

export const metadata = { title: "Integração Tray" };

export default function Pagina() {
  return (
    <EmConstrucao
      titulo="Integração Tray"
      fase={7}
      itens={["Pedidos do site entram como vendas automaticamente", "Estoque sincronizado nos dois sentidos", "Vínculo por SKU e log de sincronização"]}
    />
  );
}
