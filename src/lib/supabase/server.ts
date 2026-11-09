import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseChavePublica, supabaseUrl } from "./config";

/** Cliente Supabase para Server Components, Server Actions e Route Handlers. */
export async function criarClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseChavePublica(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado a partir de um Server Component: a renovação da sessão
          // é feita pelo proxy (src/proxy.ts), então pode ser ignorado.
        }
      },
    },
  });
}
