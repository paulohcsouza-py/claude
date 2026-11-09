import { cn } from "@/lib/utils";

/** Logotipo em texto: "Josi Corrêa" em serifa + "BOUTIQUE" em dourado. */
export function Logo({ claro = false, className }: { claro?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col leading-none", className)}>
      <span
        className={cn(
          "font-serif text-[1.45rem] font-semibold tracking-normal",
          claro ? "text-offwhite" : "text-marsala-700",
        )}
      >
        Josi Corrêa
      </span>
      <span
        className={cn(
          "mt-1 text-[0.62rem] font-medium uppercase tracking-[0.42em]",
          claro ? "text-dourado-300" : "text-dourado-500",
        )}
      >
        Boutique
      </span>
    </div>
  );
}
