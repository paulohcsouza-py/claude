import { MenuLateral } from "@/components/layout/menu-lateral";
import { NavegacaoCelular } from "@/components/layout/navegacao-celular";
import { nomePapel, obterUsuarioAtual } from "@/lib/auth";

export default async function LayoutSistema({ children }: LayoutProps<"/">) {
  const usuario = await obterUsuarioAtual();
  const props = { nome: usuario.nome, papel: usuario.papel, rotuloPapel: nomePapel(usuario.papel) };

  return (
    <div className="min-h-dvh">
      <MenuLateral {...props} />
      <NavegacaoCelular {...props} />
      <main className="pb-barra-inferior px-4 pt-5 sm:px-6 lg:ml-64 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
