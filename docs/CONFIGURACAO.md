# Guia de configuração — passo a passo

Tempo estimado: 40 minutos. Você vai criar 3 contas gratuitas:
**Supabase** (banco de dados), **Netlify** (site no ar) e usar o **GitHub** (onde o código está).

> 💡 Guarde todas as senhas num gerenciador de senhas (ex.: o do Google ou do iPhone).
> Nunca envie senhas ou chaves por WhatsApp ou pelo chat.

---

## 1. Supabase — criar o banco de dados

1. Acesse **supabase.com** → **Start your project** → entre com sua conta do GitHub ou e-mail.
2. Clique em **New project**:
   - **Name:** `josi-correa-gestao`
   - **Database Password:** clique em **Generate a password** e **guarde essa senha**.
   - **Region:** `South America (São Paulo)`
   - Clique em **Create new project** e espere uns 2 minutos.
3. **Bloquear cadastro público** (só você cria usuários):
   menu lateral **Authentication** → **Sign In / Providers** → desligue
   **Allow new users to sign up** → **Save**.
4. **Copiar as chaves do site** (vamos usar no passo 3):
   **Project Settings** (engrenagem) → **API Keys**. Anote:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`) — também aparece em *Project Settings → Data API*;
   - **Publishable key** (começa com `sb_publishable_`).
5. **Copiar a conexão do banco** (para backup e atualizações automáticas):
   botão **Connect** (no topo) → aba **Connection String** → em **Method** escolha
   **Session pooler** → copie o endereço `postgresql://postgres.xxxx:[YOUR-PASSWORD]@...:5432/postgres`.
   Troque `[YOUR-PASSWORD]` pela senha do item 2 (sem os colchetes).
   > Use o **Session pooler**, não o "Direct connection" (o GitHub não alcança a conexão direta).

## 2. GitHub — guardar os segredos

No repositório do sistema no GitHub: **Settings** → **Secrets and variables** → **Actions** →
**New repository secret**. Crie dois segredos:

| Nome | Valor |
|---|---|
| `SUPABASE_DB_URL` | o endereço do item 1.5 (já com a senha) |
| `BACKUP_SENHA` | uma senha nova e forte, só para os backups. **Guarde-a bem: sem ela os backups não abrem.** |

Depois: aba **Actions** → **Aplicar migrações do banco** → **Run workflow** → **Run workflow**.
Em 1 minuto deve aparecer um ✅ verde. Isso cria as tabelas do sistema.

> Se aparecer um aviso para habilitar os workflows ("I understand my workflows, go ahead and enable them"), clique para habilitar.

## 3. Netlify — colocar o sistema no ar

1. Acesse **netlify.com** → **Sign up** → **GitHub** (autorize o acesso ao repositório).
2. **Add new project** → **Import an existing project** → **GitHub** → escolha o repositório.
3. Em **Branch to deploy**, deixe a branch principal do repositório.
4. Em **Environment variables** → **Add environment variables**, crie:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL (item 1.4) |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (item 1.4) |

5. Clique em **Deploy**. Em ~3 minutos o site fica no ar.
6. (Opcional) **Project configuration** → **Change project name** → `josicorrea-gestao`
   → o endereço fica `https://josicorrea-gestao.netlify.app`.
7. Volte ao Supabase → **Authentication** → **URL Configuration** → em **Site URL**
   coloque o endereço do Netlify → **Save**.

## 4. Criar os usuários (Josi e Paulo)

> ⚠️ **Crie primeiro o usuário da Josi.** O primeiro usuário criado vira **administradora**
> automaticamente; os seguintes viram **operador**.

1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Preencha e-mail e senha (mínimo 8 caracteres) e marque **Auto Confirm User** → **Create user**.
3. Repita para o Paulo.
4. **Dar acesso total ao Paulo:** entre no sistema com o usuário da Josi → **Configurações** →
   **Equipe** → no cartão do Paulo, troque **Operador** por **Administradora** → **Salvar**.
5. Cada um ajusta o próprio nome em **Minha conta** (o nome inicial vem do e-mail).

Para desativar alguém ou trocar o papel: no sistema, **Configurações → Equipe** (só a Josi).
Para redefinir uma senha esquecida: Supabase → **Authentication** → **Users** → clique no
usuário → **Send password recovery** (ou exclua e crie de novo).

## 5. Instalar no celular

- **iPhone:** abra o endereço do sistema no **Safari** → botão **Compartilhar** (quadrado com seta para cima)
  → role e toque em **Adicionar à Tela de Início** → **Adicionar**. Abra sempre pelo ícone na tela
  (abre em tela cheia, como um app). No primeiro acesso, faça o login e marque para o iPhone salvar a senha.
- **Android (Chrome):** abra o endereço → menu **⋮** → **Instalar app** (ou "Adicionar à tela inicial").

O ícone "JC" marsala aparece na tela, e o sistema abre como um aplicativo.

## 6. Como as atualizações chegam

A cada fase concluída, o código novo é enviado ao GitHub. Automaticamente:
- o **Netlify** publica a nova versão do site (~3 min);
- o GitHub **atualiza a estrutura do banco** (workflow "Aplicar migrações do banco").

Você não precisa fazer nada além de testar. 🙂

## Avisos sobre os planos gratuitos

- **Supabase:** o projeto **pausa após 7 dias sem uso**. Com uso diário isso não acontece;
  se pausar, entre no painel do Supabase e clique em **Restore project**.
- **GitHub:** em repositórios públicos, tarefas agendadas (o backup) são desligadas após
  60 dias sem nenhuma alteração no repositório. O GitHub avisa por e-mail; basta reativar em **Actions**.
- **Recomendado:** deixe o repositório **privado** (Settings → General → Danger Zone → Change visibility).
