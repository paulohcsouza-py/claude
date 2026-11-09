import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "fantasma" | "perigo";
type Tamanho = "md" | "lg";

const variantes: Record<Variante, string> = {
  primario:
    "bg-marsala-700 text-white hover:bg-marsala-800 active:bg-marsala-900 disabled:bg-marsala-300",
  secundario:
    "bg-white text-marsala-700 border border-marsala-200 hover:bg-marsala-50 disabled:text-marsala-300",
  fantasma: "text-marsala-700 hover:bg-marsala-50 disabled:text-marsala-300",
  perigo: "bg-red-700 text-white hover:bg-red-800 disabled:bg-red-300",
};

const tamanhos: Record<Tamanho, string> = {
  md: "h-11 px-4 text-[15px]",
  lg: "h-13 px-6 text-base",
};

export function classesBotao(variante: Variante = "primario", tamanho: Tamanho = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
    "disabled:cursor-not-allowed select-none",
    variantes[variante],
    tamanhos[tamanho],
    extra,
  );
}

export function Botao({
  variante = "primario",
  tamanho = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; tamanho?: Tamanho }) {
  return <button className={classesBotao(variante, tamanho, className)} {...props} />;
}
