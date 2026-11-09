"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { Logo } from "@/components/marca/logo";
import { ITENS_MENU, estaAtivo } from "@/lib/navegacao";
import { cn } from "@/lib/utils";
import type { Papel } from "@/lib/auth";
import { sair } from "@/app/login/actions";

/** Menu fixo à esquerda (computador). */
export function MenuLateral({ nome, papel, rotuloPapel }: { nome: string; papel: Papel; rotuloPapel: string }) {
  const caminho = usePathname();
  const itens = ITENS_MENU.filter((i) => !i.somenteAdmin || papel === "admin");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-marsala-800 text-marsala-50 lg:flex">
      <div className="px-6 pt-7 pb-6">
        <Logo claro />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Menu principal">
        {itens.map(({ href, rotulo, icone: Icone }) => {
          const ativo = estaAtivo(href, caminho);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors",
                ativo
                  ? "bg-marsala-700 text-white shadow-[inset_3px_0_0_var(--color-dourado-300)]"
                  : "text-marsala-100 hover:bg-marsala-700/60 hover:text-white",
              )}
            >
              <Icone className={cn("size-5", ativo ? "text-dourado-300" : "text-marsala-200")} aria-hidden />
              {rotulo}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-marsala-700 p-3">
        <Link
          href="/conta"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-marsala-700/60"
        >
          <span className="grid size-9 place-items-center rounded-full bg-marsala-600 text-dourado-200">
            <UserRound className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">{nome}</span>
            <span className="block text-xs text-marsala-200">{rotuloPapel}</span>
          </span>
        </Link>
        <form action={sair}>
          <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-marsala-100 hover:bg-marsala-700/60 hover:text-white">
            <LogOut className="size-5 text-marsala-200" aria-hidden />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
