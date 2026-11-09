import type { Metadata } from "next";
import { Logo } from "@/components/marca/logo";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaLogin({ searchParams }: PageProps<"/login">) {
  const { voltar } = await searchParams;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-marsala-800 lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div
          aria-hidden
          className="absolute -right-32 -top-32 size-[28rem] rounded-full border border-dourado-400/25"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-24 size-[34rem] rounded-full border border-dourado-400/15"
        />
        <Logo claro className="relative [&>span:first-child]:text-5xl [&>span:last-child]:text-sm" />
        <p className="relative max-w-sm font-serif text-2xl leading-snug text-marsala-100">
          Moda social e de festa, com a mesma elegância também nos bastidores.
        </p>
      </section>

      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-10 lg:hidden" />
          <h1 className="text-3xl text-marsala-800">Entrar</h1>
          <p className="mt-1 mb-8 text-tinta-suave">Acesse o sistema de gestão da boutique.</p>
          <FormularioLogin voltar={typeof voltar === "string" ? voltar : undefined} />
          <p className="mt-8 text-center text-sm text-tinta-suave">
            Esqueceu a senha? Peça para a Josi redefinir.
          </p>
        </div>
      </section>
    </main>
  );
}
