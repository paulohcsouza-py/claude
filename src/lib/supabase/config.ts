/** Lê as variáveis públicas do Supabase com mensagem de erro clara. */
export function supabaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error("Variável NEXT_PUBLIC_SUPABASE_URL não configurada.");
  return v;
}

export function supabaseChavePublica(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!v) throw new Error("Variável NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não configurada.");
  return v;
}
