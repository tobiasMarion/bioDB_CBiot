# 📦 Bio Database

Este repositório segue o padrão de **monorepo**, ou seja, temos múltiplos projetos dentro do mesmo repositório, organizados dentro da pasta `apps/`.

A ideia dessa estrutura é manter tudo centralizado (frontend, backend, etc.), mas ainda separado o suficiente para cada parte evoluir de forma independente.

---

## 🗂️ Estrutura geral

```bash
.
├── apps/
│   └── frontend/
├── biome.json
├── package.json
├── docs/
```

---

## 🌍 Configuração global

### 🧹 Biome

O Biome é uma ferramenta global do projeto — ou seja, vale para **todos os apps dentro de `apps/`**.

Ele é responsável por padronizar o código automaticamente.

---

### 💭 Problema

Sem uma ferramenta assim, cada pessoa pode escrever código de um jeito:

```js
const nome = "Tobias"
```

```js
const nome = 'Tobias'
```

Ou até:

```js
if (x){console.log(x)}
```

Isso não quebra o sistema, mas deixa o projeto inconsistente e difícil de manter.

---

### ⚙️ Solução

O Biome resolve isso:

* formata o código automaticamente
* aplica regras de estilo
* evita discussões desnecessárias

---

### 📍 Onde está configurado?

```bash
biome.json
```

Esse arquivo fica na raiz justamente para afetar todo o repositório.

Na prática, você não precisa se preocupar com estilo — a ferramenta cuida disso.

---

## 🎯 Apps

Todos os projetos ficam dentro da pasta:

```bash
apps/
```

Atualmente temos:

```bash
apps/frontend
```

E em breve teremos também um backend.

---

# 🎨 Frontend (`apps/frontend`)

O frontend foi criado com Vite usando React e TypeScript.

O Vite é responsável por rodar o projeto durante o desenvolvimento, criando um servidor local e atualizando o navegador automaticamente sempre que você salva um arquivo. Isso elimina a necessidade de configurações complexas e deixa o desenvolvimento muito mais rápido.

---

## ▶️ Como rodar o frontend

Entre na pasta:

```bash
apps/frontend
```

E rode:

```bash
npm install
npm run dev
```

Depois disso, abra a URL que aparecer no terminal (geralmente `http://localhost:5173`).

Qualquer alteração feita em `src/` será refletida automaticamente no navegador.

---

## 🧠 Estrutura do frontend

A maior parte do código está em:

```bash
apps/frontend/src/
```

---

### 🚪 Entrada da aplicação

```bash
src/main.tsx
```

Esse arquivo é o ponto de entrada do app. Ele conecta o React com o HTML (`index.html`) e inicializa a aplicação.

---

### 🧭 Rotas (páginas)

As páginas ficam em:

```bash
src/routes/
```

O projeto usa o TanStack Router, que funciona baseado em arquivos.

Isso significa que cada arquivo nessa pasta vira uma rota automaticamente.

Exemplo atual:

```bash
src/routes/
  index.tsx      → "/"
  profile.tsx    → "/profile"
```

O arquivo:

```bash
src/routes/__root.tsx
```

define o layout base da aplicação (estrutura comum entre páginas).

---

### ⚠️ Arquivo gerado automaticamente

```bash
src/routeTree.gen.ts
```

Esse arquivo é gerado pelo router. Não deve ser editado manualmente.

---

### 🧩 Componentes

Componentes reutilizáveis ficam em:

```bash
src/components/
```

Exemplo:

```bash
src/components/ui/button.tsx
```

Esse componente vem do shadcn/ui.

Diferente de bibliotecas tradicionais, esse código é nosso — então pode ser editado sem problema.

---

### 🎨 Estilização

A estilização é feita com Tailwind CSS.

Na prática, você vai ver código assim:

```tsx
<button className="bg-blue-500 p-2 rounded">
  Clique
</button>
```

Ou seja, o estilo é aplicado direto nas `className`.

O arquivo global de CSS é:

```bash
src/index.css
```

---

### 🧰 Código auxiliar

```bash
src/lib/utils.ts
```

Aqui ficam funções reutilizáveis (helpers).

---

### 🖼️ Assets

```bash
src/assets/
```

Imagens e arquivos usados no app.

---

### 🌍 Pasta pública

```bash
public/
```

Arquivos servidos diretamente (ex: favicon).

---

## 🔁 Como tudo funciona junto

1. Você roda `npm run dev`
2. O Vite sobe o servidor
3. O `main.tsx` inicia o React
4. O TanStack Router define qual página renderizar
5. O layout vem do `__root.tsx`
6. Os estilos vêm do Tailwind CSS
7. Componentes vêm do shadcn/ui

---

# 🛠️ Backend (`apps/backend`) — WIP 🚧

O backend ainda será configurado.

A ideia é utilizar:

* NestJS (provavelmente)
* integração com o frontend via API

---

## 📌 O que esperar aqui

Quando o backend estiver pronto, essa seção deve incluir:

* Como rodar o backend
* Estrutura de pastas (modules, controllers, services)
* Integração com banco de dados
* Comunicação com o frontend

---

## 🚧 Status

Em desenvolvimento.

---
