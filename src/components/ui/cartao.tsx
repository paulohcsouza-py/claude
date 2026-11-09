import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Cartao({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-linha bg-white p-5 shadow-suave", className)}
      {...props}
    />
  );
}

export function TituloPagina({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl text-marsala-800 lg:text-4xl">{titulo}</h1>
      {subtitulo ? <p className="mt-1 text-tinta-suave">{subtitulo}</p> : null}
    </header>
  );
}

export function Aviso({
  tipo = "info",
  children,
}: {
  tipo?: "info" | "erro" | "sucesso";
  children: React.ReactNode;
}) {
  const cores = {
    info: "border-dourado-200 bg-dourado-100/60 text-dourado-700",
    erro: "border-red-200 bg-red-50 text-red-800",
    sucesso: "border-emerald-200 bg-emerald-50 text-emerald-800",
  }[tipo];
  return (
    <div role={tipo === "erro" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 text-sm", cores)}>
      {children}
    </div>
  );
}
