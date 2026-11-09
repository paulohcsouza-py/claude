"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { Logo } from "@/components/marca/logo";
import { ITENS_MENU, estaAtivo } from "@/lib/navegacao";
import { cn } from "@/lib/utils";
import type { Papel } from "@/lib/auth";
import { sair } from "@/app/login/actions";

/** Topo + barra inferior + gaveta "Mais" (celular). */
export function NavegacaoCelular({ nome, papel, rotuloPapel }: { nome: string; papel: Papel; rotuloPapel: string }) {
  const caminho = usePathname();
  // A gaveta fica aberta só na página em que foi aberta (fecha ao navegar)
  const [abertoEm, setAbertoEm] = useState<string | null>(null);
  const aberto = abertoEm === caminho;
  const setAberto = (v: boolean) => setAbertoEm(v ? caminho : null);
  const itens = ITENS_MENU.filter((i) => !i.somenteAdmin || papel === "admin");
  const principais = itens.filter((i) => i.barraInferior);
  const outros = itens.filter((i) => !i.barraInferior);
  const maisAtivo = outros.some((i) => estaAtivo(i.href, caminho)) || caminho.startsWith("/conta");

  // Trava a rolagem do fundo com a gaveta aberta
  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-linha bg-offwhite/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
        <div className="py-3">
          <Logo className="scale-90 origin-left" />
        </div>
        <Link
          href="/conta"
          aria-label={`Minha conta (${nome})`}
          className="grid size-10 place-items-center rounded-full bg-marsala-50 text-marsala-700"
        >
          <UserRound className="size-5" aria-hidden />
        </Link>
      </header>

      <nav
        aria-label="Menu principal"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-linha bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {principais.map(({ href, rotulo, icone: Icone }) => {
          const ativo = estaAtivo(href, caminho);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                ativo ? "text-marsala-700" : "text-tinta-suave",
              )}
            >
              <Icone className={cn("size-6", ativo && "stroke-[2.2]")} aria-hidden />
              {rotulo}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-expanded={aberto}
          className={cn(
            "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium",
            maisAtivo ? "text-marsala-700" : "text-tinta-suave",
          )}
        >
          <Menu className="size-6" aria-hidden />
          Mais
        </button>
      </nav>

      {aberto ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mais opções">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-marsala-900/40"
            onClick={() => setAberto(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-offwhite px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-nude-300" aria-hidden />
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="font-medium">{nome}</p>
                <p className="text-sm text-tinta-suave">{rotuloPapel}</p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="grid size-10 place-items-center rounded-full text-tinta-suave hover:bg-nude-100"
                aria-label="Fechar"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...outros, { href: "/conta", rotulo: "Minha conta", icone: UserRound }].map(
                ({ href, rotulo, icone: Icone }) => {
                  const ativo = estaAtivo(href, caminho);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex aspect-[5/4] flex-col items-center justify-center gap-2 rounded-2xl border text-center text-sm",
                        ativo
                          ? "border-marsala-300 bg-marsala-50 text-marsala-700"
                          : "border-linha bg-white text-tinta",
                      )}
                    >
                      <Icone className="size-6 text-marsala-600" aria-hidden />
                      {rotulo}
                    </Link>
                  );
                },
              )}
            </div>
            <form action={sair} className="mt-3">
              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-linha bg-white text-[15px] text-tinta-suave">
                <LogOut className="size-5" aria-hidden />
                Sair
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
