# Deploy — bioDB no ES-Builder

Este projeto está configurado para a plataforma **ES-Builder**: deploy automático
por push na branch `deploy`, com Nginx servindo cada projeto em um subpath
(`/projeto-x/` para o frontend, `/projeto-x/api/` para a API).

## Como o deploy funciona

```
push na branch deploy
  └─ watcher do servidor (polling ~60s) detecta o novo SHA
       └─ build da imagem do backend + build da imagem do frontend
            └─ docker compose up (frontend + backend + Postgres)
                 └─ rollback automático para a versão anterior se o build falhar
```

Cada projeto recebe **3 containers**: frontend, backend e Postgres. O auth-mock
**não** roda como container separado — sua lógica de login foi incorporada ao
backend (ver abaixo).

## Arquitetura de autenticação (prova de conceito)

O portal externo que emitiria os JWTs não foi entregue por outro grupo. Como
prova de conceito, o login mockado foi portado do `apps/auth-mock` para o
backend NestJS:

- `POST /auth/login` — emite um JWT (`AuthMockController`, `apps/backend/src/auth/auth-mock.controller.ts`).
- O `id` do usuário é `sha256(email)`, idêntico ao antigo auth-mock.
- O backend valida o token nas demais rotas com o **mesmo** `JWT_SECRET` (`AuthGuard`).

O frontend usa uma **única base de API relativa** (`import.meta.env.BASE_URL + "api/"`),
então login e API passam pelo mesmo proxy. A pasta `apps/auth-mock/` permanece
como referência, mas não é mais usada em dev nem em produção.

## O que o grupo já configurou (neste repositório)

- `backend/Dockerfile` (na raiz; buildado com `context "."`, copia de `apps/backend/`) + `apps/backend/docker-entrypoint.sh` (roda `prisma migrate deploy` no start).
- `frontend/Dockerfile` (na raiz; copia de `apps/frontend/`, repassa `--build-arg VITE_BASE_PATH` para `vite build --base`) + `apps/frontend/nginx.conf` (SPA `try_files`).
- `.dockerignore` na raiz (mantém o contexto de build enxuto).
- Frontend usa base de API relativa e `basepath` no router (funciona em qualquer subpath, sem hardcode).
- Migration única `init` em `apps/backend/prisma/migrations/`.

> **Por que Dockerfiles na raiz?** O ES-Builder, por padrão, procura `backend/Dockerfile` e `frontend/Dockerfile` na raiz do repo (`context "."`). Esses Dockerfiles batem com esse padrão e apenas referenciam o código em `apps/` (`COPY apps/backend/ ...`), então **o admin não precisa ajustar nada no servidor**.

## O que o administrador do servidor precisa fazer

### 1. Cadastrar a deploy key no GitHub

Em **Settings → Deploy keys → Add deploy key** do repositório (sem *Allow write access*):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKq/ixf8XUzwaMQ7AplLWMW4GM43uQZeDZbvvuHs9Abz es-builder-deploy
```

### 2. `config/projeto-x.json` — nenhum ajuste necessário

Os Dockerfiles na raiz batem com o **default** do ES-Builder, então a config padrão
já funciona (mantida aqui só como referência):

```json
{
  "backend":  { "context": ".", "dockerfile": "backend/Dockerfile",  "port": 3000 },
  "frontend": { "context": ".", "dockerfile": "frontend/Dockerfile" }
}
```

> O backend expõe a porta **3000** (bate com o `port` acima). Só é preciso mexer
> nesta config se a porta mudar.

### 3. Variáveis de ambiente (injetadas pelo servidor)

Geradas/injetadas pelo setup do ES-Builder — nada é hardcoded no código:

| Variável | Usada por | Observação |
|----------|-----------|------------|
| `DATABASE_URL` | backend | host = `projeto-x-db` (container Postgres) |
| `JWT_SECRET` | backend (assina e valida JWT) | idêntica em todos os projetos |
| `POSTGRES_USER/PASSWORD/DB` | container Postgres | credenciais do projeto |

## Como disparar o deploy

```bash
git checkout deploy
git merge main
git push origin deploy
git checkout main
```

Ou abra um Pull Request de `main` → `deploy`. O servidor detecta o push em até ~60s.

## Migrations

- O schema é criado por uma única migration `init`.
- O `docker-entrypoint.sh` roda `npx prisma migrate deploy` automaticamente no start.
- **Regra do ES-Builder:** o rollback automático não reverte o banco. Novas migrations
  devem ser **aditivas** (evite `DROP`/`RENAME` de colunas em deploys que precisem de rollback).

## Dados de exemplo (seed)

O deploy **não** roda seed: o banco sobe vazio. Usuários são criados sob demanda no
primeiro login (o `AuthGuard` auto-cria o `User` a partir do payload do token).

Para popular dados de exemplo manualmente (⚠️ o seed **apaga** todas as tabelas antes):

```bash
# no servidor, dentro do diretório do es-builder
docker compose -f docker-compose.yml -f compose/projeto-x.yml \
  exec projeto-x-backend npx tsx prisma/seed.ts
```

## Verificação local

```bash
npm run docker:up        # Postgres de dev
npm run dev              # backend (3000) + frontend (5173)
# Abrir http://localhost:5173 e logar com admin@example.com + qualquer senha.
# Network: POST /api/auth/login e GET /api/users/me devem retornar 200 (via proxy do Vite).
```

Build das imagens (simula produção):

```bash
# Context é a raiz do repo (igual ao ES-Builder)
docker build -t biodb-backend  -f backend/Dockerfile  .
docker build -t biodb-frontend -f frontend/Dockerfile . \
  --build-arg VITE_BASE_PATH=/projeto-x/

# Conferir que os assets já vêm com o subpath:
docker run --rm biodb-frontend cat /usr/share/nginx/html/index.html | grep projeto-x
```
