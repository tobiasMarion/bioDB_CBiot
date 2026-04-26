# 📦 Bio Database

Este repositório segue o padrão de **monorepo**, ou seja, temos múltiplos projetos dentro do mesmo repositório, organizados dentro da pasta `apps/`.

A ideia dessa estrutura é manter tudo centralizado (frontend, backend, autenticação), mas ainda separado o suficiente para cada parte evoluir de forma independente.

---

## 🗂️ Estrutura geral

```bash
.
├── apps/
│   ├── frontend/     # A interface do usuário
│   ├── backend/      # O servidor principal (API e Banco de Dados)
│   └── auth-mock/    # O servidor de autenticação simulado (Login)
├── biome.json        # Configuração de padronização de código
├── package.json
├── docs/
```

---

## 🌍 Configuração global

### 🧹 Biome

O Biome é uma ferramenta global do projeto — ou seja, vale para **todos os apps dentro de `apps/`**. Ele é responsável por padronizar o código automaticamente (formatando e aplicando regras de estilo para evitar que cada um escreva de um jeito diferente).

**Onde está configurado?**
Fica no arquivo `biome.json` na raiz. Na prática, você não precisa se preocupar com estilo — a ferramenta cuida disso!

---

## 🎯 Nossos Apps

Todos os projetos do nosso sistema ficam dentro da pasta `apps/`. Eles trabalham juntos, mas cada um tem um papel específico no sistema.

---

# 🎨 1. Frontend (`apps/frontend`)

Foi criado com **Vite** usando **React** e **TypeScript**.
O Vite é responsável por rodar o projeto durante o desenvolvimento, atualizando o navegador automaticamente sempre que você salva um arquivo.

### 🧩 Como é feito por dentro?
- **Rotas:** Usamos o `TanStack Router` (cada arquivo na pasta `src/routes/` vira uma página automaticamente, como `index.tsx` para `/` e `profile.tsx` para `/profile`).
- **Visual:** O estilo visual é feito com **Tailwind CSS** (estilização direto nas classes, ex: `<button className="bg-blue-500">`) e com componentes prontos do **shadcn/ui**.

### ▶️ Como rodar o frontend sozinho:
```bash
cd apps/frontend
npm install
npm run dev
```
Acesse `http://localhost:5173`.

---

# 🛠️ 2. Backend (`apps/backend`)

O backend é o "cérebro" e a "memória" do sistema. É ele que processa as regras de negócio e salva as informações no banco de dados.

Foi criado com **NestJS** e usa **Prisma ORM** para se conectar a um banco de dados **PostgreSQL**.

### 🧩 Como é feito por dentro?
- **NestJS:** Organiza o código em "módulos" e "controladores". Quando o frontend pede uma informação (ex: "me dê a lista de usuários"), o controlador do NestJS atende o pedido.
- **Prisma & PostgreSQL:** O banco de dados Postgres é onde os dados ficam salvos de verdade (tabelas, colunas). O Prisma é a ferramenta que facilita a conversa entre o NestJS e o banco de dados sem precisarmos escrever SQL na mão.

### ▶️ Como rodar o backend sozinho:
```bash
cd apps/backend
npm install
npm run start:dev
```

---

# 🔐 3. Auth Mock (`apps/auth-mock`)

Este é um servidor auxiliar simples que criamos para **simular** um serviço externo de autenticação (que será desenvolvido pelo outro grupo).

Foi feito com **Fastify** (bem leve e rápido). O objetivo dele é apenas validar se um usuário está logado e gerar um "Crachá Virtual" (chamado **Token JWT**) para que o Frontend possa se comunicar com segurança com o Backend.

### ▶️ Como rodar o Auth Mock sozinho:
```bash
cd apps/auth-mock
npm install
npm run dev
```

---

# 🌊 Fluxos de Dados (Implementações Futuras)

Para quem nunca mexeu com a stack, pode parecer confuso como essas 3 partes conversam entre si. Aqui está a explicação de como os fluxos de dados vão funcionar no futuro:

### 1️⃣ Fluxo de Login (Entrando no sistema)
Quando o usuário digita e-mail e senha no **Frontend**:
1. O **Frontend** manda as credenciais para o **Auth Mock**.
2. O **Auth Mock** verifica se a senha está correta.
3. Se estiver tudo certo, o Auth Mock cria um **Token JWT** (o "Crachá") e devolve para o Frontend.
4. O **Frontend** guarda esse Token no navegador.

### 2️⃣ Fluxo de Requisição Autenticada (Acessando dados protegidos)
Quando o usuário logado tenta acessar uma lista de dados importantes (ex: lista de amostras):
1. O **Frontend** faz um pedido para o **Backend**, e manda junto o Token JWT ("Crachá") no cabeçalho (Header) da requisição.
2. O **Backend (NestJS)** recebe o pedido. Antes de buscar a informação, ele olha o Token e verifica: "Esse crachá é válido? Quem emitiu?".
3. Após confirmar que o Token é válido (usando as mesmas chaves do Auth Mock), o Backend libera o acesso.
4. O **Backend** pede os dados ao banco de dados via **Prisma**.
5. O **Prisma** busca as informações no **PostgreSQL** e as entrega ao Backend.
6. O **Backend** envia os dados formatados de volta ao **Frontend**.
7. O **Frontend** exibe a lista bonita na tela para o usuário!

---

## 🚀 Como rodar o projeto inteiro (Melhor DX)

Para facilitar a vida de todos e não precisar abrir 4 terminais diferentes, configuramos scripts na raiz do projeto que usam as *Workspaces* do NPM.

Tudo o que você precisa fazer, a partir da pasta **raiz do projeto**, é instalar as dependências e rodar o comando global:

```bash
npm install
npm run dev
```

### O que o `npm run dev` faz por baixo dos panos?
1. **`docker:up`**: Sobe o contêiner do banco de dados (PostgreSQL) usando Docker em background.
2. **`wait-on tcp:5432`**: Aguarda o banco de dados estar 100% pronto antes de tentar ligar o Backend (evitando erros chatos de conexão).
3. **`concurrently`**: Inicia o Frontend, o Backend e o Auth Mock em paralelo, cada um com uma cor diferente no mesmo terminal!

Para desligar os servidores, basta dar `Ctrl + C` no terminal. 

Para parar e remover o contêiner do banco de dados (opcional), você pode rodar:
```bash
npm run docker:down
```
