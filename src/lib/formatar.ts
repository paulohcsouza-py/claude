/** Formatação padrão do sistema: pt-BR, R$, fuso America/Sao_Paulo. */
export const FUSO = "America/Sao_Paulo";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const data = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", year: "numeric" });
const dataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatarMoeda(valor: number | string | null | undefined): string {
  return moeda.format(Number(valor ?? 0));
}

/** dd/mm/aaaa. Aceita Date, ISO com hora ou data pura (aaaa-mm-dd). */
export function formatarData(valor: Date | string | null | undefined): string {
  if (!valor) return "";
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [a, m, d] = valor.split("-");
    return `${d}/${m}/${a}`;
  }
  return data.format(new Date(valor));
}

/** dd/mm/aaaa hh:mm no horário de Brasília. */
export function formatarDataHora(valor: Date | string | null | undefined): string {
  if (!valor) return "";
  return dataHora.format(new Date(valor)).replace(",", "");
}

/** Saudação conforme a hora em Joinville. */
export function saudacao(agora = new Date()): string {
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", hourCycle: "h23" }).format(agora),
  );
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}
