import {
  BarChart3,
  Briefcase,
  HandCoins,
  Home,
  Landmark,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Papel } from "@/lib/auth";

export type ItemMenu = {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  /** Aparece na barra inferior do celular (máx. 4) */
  barraInferior?: boolean;
  somenteAdmin?: boolean;
};

export const ITENS_MENU: ItemMenu[] = [
  { href: "/", rotulo: "Início", icone: Home, barraInferior: true },
  { href: "/vendas", rotulo: "Vender", icone: ShoppingBag, barraInferior: true },
  { href: "/estoque", rotulo: "Estoque", icone: Package, barraInferior: true },
  { href: "/clientes", rotulo: "Clientes", icone: Users, barraInferior: true },
  { href: "/caixa", rotulo: "Caixa", icone: Wallet },
  { href: "/condicionais", rotulo: "Condicional", icone: Briefcase },
  { href: "/crediario", rotulo: "Crediário", icone: HandCoins },
  { href: "/financeiro", rotulo: "Financeiro", icone: Landmark },
  { href: "/relatorios", rotulo: "Relatórios", icone: BarChart3 },
  { href: "/tray", rotulo: "Integração Tray", icone: RefreshCw },
  { href: "/configuracoes", rotulo: "Configurações", icone: Settings, somenteAdmin: true },
];

export function itensPara(papel: Papel): ItemMenu[] {
  return ITENS_MENU.filter((i) => !i.somenteAdmin || papel === "admin");
}

export function estaAtivo(href: string, caminho: string): boolean {
  return href === "/" ? caminho === "/" : caminho === href || caminho.startsWith(`${href}/`);
}
