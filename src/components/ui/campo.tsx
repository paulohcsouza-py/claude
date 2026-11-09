import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Campo({
  rotulo,
  ajuda,
  erro,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; ajuda?: string; erro?: string }) {
  const campoId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={campoId} className="text-sm font-medium text-tinta">
        {rotulo}
      </label>
      <input
        id={campoId}
        className={cn(
          "h-12 rounded-xl border bg-white px-3.5 text-base text-tinta outline-none transition",
          "placeholder:text-tinta-suave/60 focus:border-marsala-400 focus:ring-4 focus:ring-marsala-100",
          erro ? "border-red-400" : "border-linha",
          className,
        )}
        aria-invalid={erro ? true : undefined}
        {...props}
      />
      {erro ? (
        <p className="text-sm text-red-700">{erro}</p>
      ) : ajuda ? (
        <p className="text-sm text-tinta-suave">{ajuda}</p>
      ) : null}
    </div>
  );
}
