# Backup e restauração do banco

O plano gratuito do Supabase não faz backup automático. Por isso o sistema tem uma
rotina própria, que roda no GitHub (fora do Supabase).

## Como funciona

- **Quando:** toda **segunda-feira às 03:17** (horário de Brasília). Também dá para rodar na hora.
- **O que entra:** todos os dados do sistema + os logins (e-mails e senhas criptografadas).
- **Segurança:** o arquivo é **criptografado** com a senha `BACKUP_SENHA`. Sem ela, ninguém abre o backup — nem você. Guarde-a.
- **Onde fica:** no próprio GitHub, por **90 dias** (≈ 13 backups semanais).
- **Se falhar:** o GitHub envia um e-mail para o dono do repositório.

> 📸 As **fotos das peças** (que chegam na fase 2) ficam no armazenamento de arquivos do
> Supabase e terão uma rotina de cópia própria, a ser incluída na fase 2.

## Fazer um backup agora

GitHub → aba **Actions** → **Backup do banco** → **Run workflow** → **Run workflow**.

## Baixar um backup (para guardar no Google Drive, por exemplo)

GitHub → **Actions** → **Backup do banco** → clique na execução desejada →
no fim da página, em **Artifacts**, clique em `backup-banco-N` para baixar.

> Recomendado: **uma vez por mês**, baixe o backup mais recente e guarde no Google Drive.
> Assim você tem cópias com mais de 90 dias.

## Restaurar (se algo grave acontecer)

A restauração é feita **num projeto Supabase novo**. O sistema se recusa a restaurar por cima de um banco com dados, para evitar acidentes.

1. **Crie um projeto novo no Supabase** (igual ao passo 1 do guia de configuração,
   com outro nome, ex.: `josi-correa-gestao-2`) e copie a conexão **Session pooler** com a senha.
2. No GitHub → **Settings** → **Secrets and variables** → **Actions** → crie o segredo
   `RESTAURAR_DB_URL` com essa conexão.
3. Descubra o **número da execução** do backup que você quer:
   **Actions** → **Backup do banco** → clique na execução → o número são os dígitos no final
   do endereço da página (ex.: `.../actions/runs/`**`12345678901`**).
4. **Actions** → **Restaurar backup** → **Run workflow**:
   - *Número da execução do backup:* o número do item 3;
   - *Digite RESTAURAR para confirmar:* `RESTAURAR`.
5. Aguarde o ✅. No final do registro aparece a conferência, tabela por tabela
   (quantidade de registros no backup × restaurados).
6. Aponte o sistema para o banco novo:
   - **Netlify** → *Project configuration* → *Environment variables*: troque
     `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` pelos do projeto novo →
     *Deploys* → *Trigger deploy*;
   - **GitHub**: troque o segredo `SUPABASE_DB_URL` pela conexão do projeto novo
     (para os próximos backups saírem do banco certo);
   - **Supabase (projeto novo)**: repita os itens 1.3 (bloquear cadastro) e 3.7 (Site URL).
7. Entre no sistema com os mesmos e-mails e senhas de antes.

### Restaurar um backup guardado no Google Drive

Se o backup não estiver mais no GitHub (mais de 90 dias), um desenvolvedor pode usar o
script `scripts/restaurar-backup.sh` com o arquivo `.gpg` baixado:

```bash
RESTAURAR_DB_URL='postgresql://...' BACKUP_SENHA='...' scripts/restaurar-backup.sh backup-josi-correa_AAAA-MM-DD_HHhMM.tar.gz.gpg
```

(Requer `psql`/`pg_dump` 17, `gpg` e o Supabase CLI, rodando de dentro do repositório.)
