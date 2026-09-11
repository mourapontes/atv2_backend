# DevShowcase API

Backend da plataforma **DevShowcase**.

> **Etapa final do projeto prático:** regras avançadas na camada de serviço, tratamento global de erros, documentação interativa (Swagger/OpenAPI) e deploy em produção.

🔗 **API em produção:** [https://devshowcase-api-z5wy.onrender.com](https://devshowcase-api-z5wy.onrender.com) · Swagger UI: [https://devshowcase-api-z5wy.onrender.com/api/docs](https://devshowcase-api-z5wy.onrender.com/api/docs)

> Hospedado no plano Free do Render — a primeira requisição após um período de inatividade pode demorar alguns segundos (cold start).

## Contexto acadêmico

| Item | Detalhe |
|---|---|
| Instituição | Universidade Aberta do Brasil (UAB) / UESPI |
| Curso | Tecnologia em Sistemas para Internet |
| Disciplina | Backend |
| Atividade | Regras avançadas, tratamento de erros e deploy em nuvem |

**Objetivo da atividade:** transformar a base do DevShowcase em uma API robusta, pronta para produção, aplicando regras de negócio na camada de serviço e realizando o deploy em um provedor de nuvem gratuito.

**Requisitos técnicos entregues:**
1. Endpoints REST implementados e testados: `POST /api/projects/:id/feedbacks` (nota 1-5 + comentário, com recálculo da nota média), `PUT /api/projects/:id/upvote` (incrementa curtidas) e `GET /api/projects` (filtro por tecnologia + paginação).
2. Camada de service com as regras de negócio (validação de relacionamentos, recálculo de nota média, incremento de upvotes), separada de controllers e repositories.
3. Tratamento global de exceções (400, 404, 409, JSON malformado) e documentação interativa via Swagger/OpenAPI em `/api/docs`.
4. Deploy em produção: PostgreSQL em nuvem (Supabase ou Render PostgreSQL), deploy contínuo a partir do GitHub no Render, credenciais via variáveis de ambiente.

## Sumário

- [Contexto acadêmico](#contexto-acadêmico)
- [Stack tecnológica](#stack-tecnológica)
- [Modelagem de domínio](#modelagem-de-domínio)
- [Arquitetura do projeto](#arquitetura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Testando em produção](#testando-em-produção)
- [Documentação interativa (Swagger/OpenAPI)](#documentação-interativa-swaggeropenapi)
- [Tratamento global de erros](#tratamento-global-de-erros)
- [Testes automatizados](#testes-automatizados)
- [Deploy em produção](#deploy-em-produção)
- [Solução de problemas](#solução-de-problemas)
- [Próximas etapas](#próximas-etapas)

## Stack tecnológica

| Camada          | Tecnologia                                    |
|-----------------|------------------------------------------------|
| Runtime         | Node.js (≥ 18)                                 |
| Framework HTTP  | Express                                        |
| ORM             | Sequelize — PostgreSQL                        |
| Banco de dados  | PostgreSQL (via `pg`/`pg-hstore`)              |
| Containers      | Docker + Docker Compose                        |
| Validação       | Joi (DTOs de entrada)                          |
| Documentação    | Swagger UI / OpenAPI 3.0 (`/api/docs`)         |
| Segurança       | Helmet (headers HTTP)                          |
| Testes          | Jest + Supertest                               |
| Deploy          | Render (PaaS) + Supabase/Render PostgreSQL     |

## Modelagem de domínio

4 entidades e 3 relacionamentos, conforme exigido na especificação:

```mermaid
erDiagram
    PROFILE ||--o{ PROJECT : "1:N"
    PROJECT ||--o{ FEEDBACK : "1:N"
    PROJECT }o--o{ TECHNOLOGY : "N:N"

    PROFILE {
        int id PK
        string name
        string email
        text bio
        string avatarUrl
    }
    PROJECT {
        int id PK
        string title
        text description
        string repositoryUrl
        int profileId FK
        float averageRating
        int upvotes
    }
    TECHNOLOGY {
        int id PK
        string name
    }
    FEEDBACK {
        int id PK
        text comment
        int rating
        int projectId FK
    }
```

- **Profile 1:N Project** — um perfil possui vários projetos.
- **Project N:N Technology** — um projeto usa várias tecnologias, e uma tecnologia aparece em vários projetos (tabela de junção `project_technologies`).
- **Project 1:N Feedback** — um projeto recebe vários feedbacks.

## Arquitetura do projeto

Fluxo de uma requisição, camada por camada:

```mermaid
flowchart LR
    A[Rota] --> B[Middleware de validação<br/>Joi / DTO de entrada e query/params]
    B --> C[Controller]
    C --> D[Service<br/>regras de negócio]
    D --> E[Repository]
    E --> F[Model Sequelize]
    F --> G[(Banco de dados)]
    C --> H[DTO de saída]
    H --> I[Resposta JSON]
    C -.erro.-> J[Error Handler global]
    J --> I
```

```
src/
  config/database.js   # Configuração do Sequelize (PostgreSQL)
  config/swagger.js     # Especificação OpenAPI servida em /api/docs
  models/               # Entidades e associações (Profile, Project, Technology, Feedback)
  dtos/                 # Schemas de validação (entrada/query/params) e formatação (saída)
  repositories/         # Camada de acesso a dados (queries Sequelize)
  services/             # Regras de negócio (validação de relacionamentos, nota média, upvotes)
  controllers/          # Lógica de cada endpoint (chama services)
  routes/                # Definição das rotas REST
  middlewares/           # Validação de entrada (Joi) e tratamento global de erros
  app.js                 # Configuração do Express (helmet, cors, swagger, error handler)
  server.js              # Ponto de entrada: conecta ao banco e sobe o servidor
scripts/
  demo.js                # Script de demonstração ao vivo (chama todos os endpoints)
  demo.html              # Mesma demonstração, executável direto no navegador
  init-multiple-databases.sh  # Cria os bancos dev/test no container do PostgreSQL
tests/
  *.test.js              # Testes de integração (Jest + Supertest)
render.yaml              # Blueprint de deploy contínuo no Render
Dockerfile               # Imagem da API (Node 20)
docker-compose.yml        # Sobe API + PostgreSQL localmente
```

## Endpoints da API

| Método | Rota                                | Descrição                                                        |
|--------|-------------------------------------|--------------------------------------------------------------------|
| POST   | `/api/profiles`                    | Cadastra um perfil de desenvolvedor                                 |
| GET    | `/api/profiles/:id`                | Busca um perfil por id                                              |
| POST   | `/api/technologies`                | Cadastra uma tecnologia                                             |
| GET    | `/api/technologies`                | Lista todas as tecnologias                                          |
| POST   | `/api/projects`                    | Cadastra um projeto                                                 |
| GET    | `/api/projects`                    | Lista projetos com filtro por tecnologia e paginação                |
| POST   | `/api/projects/:id/feedbacks`      | Registra nota (1-5) + comentário e recalcula a nota média do projeto |
| PUT    | `/api/projects/:id/upvote`         | Incrementa em 1 as curtidas/estrelas (upvotes) do projeto            |

### Profiles

**POST /api/profiles**
```json
{
  "name": "Ana Souza",
  "email": "ana@example.com",
  "bio": "Dev backend apaixonada por APIs",
  "avatarUrl": "https://example.com/ana.png"
}
```
Validações: `name` obrigatório e não vazio · `email` obrigatório, formato válido e único · `avatarUrl` opcional, deve ser URL válida.

**GET /api/profiles/:id** — retorna o perfil com a lista de projetos vinculados (404 se não existir).

### Technologies

**POST /api/technologies**
```json
{ "name": "Node.js" }
```
Validações: `name` obrigatório, não vazio e único (409 se duplicado).

**GET /api/technologies** — lista todas as tecnologias, ordenadas por nome.

### Projects

**POST /api/projects**
```json
{
  "title": "DevShowcase API",
  "description": "Backend do projeto",
  "repositoryUrl": "https://github.com/ana/devshowcase",
  "profileId": 1,
  "technologyIds": [1, 2]
}
```
Validações: `title` obrigatório e não vazio · `repositoryUrl` obrigatória e deve ser URL válida · `profileId` obrigatório e deve referenciar um Profile existente · `technologyIds` opcional, deve referenciar Technologies existentes.

**GET /api/projects** — lista projetos de forma paginada. Aceita os parâmetros de query:
- `profileId` — filtra projetos de um perfil específico;
- `technology` — filtra projetos que usam a tecnologia informada (busca parcial, case-insensitive);
- `page` (padrão `1`) e `limit` (padrão `10`, máximo `100`) — paginação dos resultados.

Resposta:
```json
{
  "data": [ { "id": 1, "title": "...", "averageRating": 4.5, "upvotes": 3, "...": "..." } ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

### Feedbacks

**POST /api/projects/:id/feedbacks**
```json
{ "rating": 5, "comment": "Excelente projeto!" }
```
Validações: `rating` obrigatório, inteiro entre 1 e 5 · `comment` obrigatório e não vazio · `id` do projeto deve existir (404 caso contrário).

Regra de negócio (camada de service): a cada feedback cadastrado, a nota média (`averageRating`) do projeto é recalculada a partir de todos os feedbacks existentes.

Resposta:
```json
{
  "feedback": { "id": 1, "rating": 5, "comment": "Excelente projeto!", "projectId": 1 },
  "projectAverageRating": 5
}
```

### Upvote

**PUT /api/projects/:id/upvote** — incrementa em 1 o campo `upvotes` do projeto e retorna o projeto atualizado. Responde `404` se o projeto não existir.

## Testando em produção

O deploy já está no ar em [https://devshowcase-api-z5wy.onrender.com](https://devshowcase-api-z5wy.onrender.com). Todos os exemplos abaixo apontam direto para a API em produção — não é necessário rodar nada localmente.

> O serviço está no plano Free do Render: se ficar inativo por um tempo, a primeira requisição pode demorar ~30s (cold start) antes de responder.

### Clique para abrir (endpoints `GET`)

Os links abaixo são endpoints `GET` reais, testados e funcionando — clique para abrir a resposta direto no navegador:

- [Health check — `GET /api`](https://devshowcase-api-z5wy.onrender.com/api)
- [Swagger UI — documentação interativa](https://devshowcase-api-z5wy.onrender.com/api/docs)
- [Buscar perfil por id — `GET /api/profiles/2`](https://devshowcase-api-z5wy.onrender.com/api/profiles/2)
- [Listar tecnologias — `GET /api/technologies`](https://devshowcase-api-z5wy.onrender.com/api/technologies)
- [Listar projetos — `GET /api/projects`](https://devshowcase-api-z5wy.onrender.com/api/projects)
- [Listar projetos com filtro por tecnologia e paginação — `GET /api/projects?technology=Node&page=1&limit=5`](https://devshowcase-api-z5wy.onrender.com/api/projects?technology=Node&page=1&limit=5)
- [Projeto inexistente (exemplo de erro 404) — `GET /api/profiles/999999`](https://devshowcase-api-z5wy.onrender.com/api/profiles/999999)

### Testando com `curl`

Endpoints `POST`/`PUT` (criar perfil, criar tecnologia, criar projeto, registrar feedback, dar upvote) não abrem só com um clique — use os exemplos de `curl` abaixo, já apontando para a URL de produção:

```bash
# Criar perfil
curl -X POST https://devshowcase-api-z5wy.onrender.com/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Souza","email":"ana@example.com"}'

# Buscar perfil
curl https://devshowcase-api-z5wy.onrender.com/api/profiles/1

# Criar tecnologia
curl -X POST https://devshowcase-api-z5wy.onrender.com/api/technologies \
  -H "Content-Type: application/json" -d '{"name":"Node.js"}'

# Listar tecnologias
curl https://devshowcase-api-z5wy.onrender.com/api/technologies

# Criar projeto
curl -X POST https://devshowcase-api-z5wy.onrender.com/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"DevShowcase API","repositoryUrl":"https://github.com/ana/devshowcase","profileId":1,"technologyIds":[1]}'

# Listar projetos (com filtro e paginação)
curl "https://devshowcase-api-z5wy.onrender.com/api/projects?technology=Node&page=1&limit=10"

# Registrar feedback (nota + comentário) em um projeto
curl -X POST https://devshowcase-api-z5wy.onrender.com/api/projects/1/feedbacks \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Excelente projeto!"}'

# Dar upvote em um projeto
curl -X PUT https://devshowcase-api-z5wy.onrender.com/api/projects/1/upvote
```

### Testando pelo navegador

A barra de endereço do navegador só faz requisições `GET`, então funciona diretamente para os links da seção acima. Para testar os endpoints `POST` pelo navegador, abra o **DevTools (F12) → Console** (em qualquer página) e rode `fetch`:

```js
fetch('https://devshowcase-api-z5wy.onrender.com/api/technologies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Node.js' }),
}).then((r) => r.json()).then(console.log);
```

### Swagger UI

Ou use o [Swagger UI](https://devshowcase-api-z5wy.onrender.com/api/docs) (botão "Try it out" em cada endpoint) para testar qualquer endpoint, incluindo `POST`/`PUT`, direto pelo navegador — sem precisar montar `curl` ou `fetch` manualmente.

## Documentação interativa (Swagger/OpenAPI)

A API expõe sua especificação OpenAPI 3.0 (`src/config/swagger.js`) através do Swagger UI, disponível em produção em:

[https://devshowcase-api-z5wy.onrender.com/api/docs](https://devshowcase-api-z5wy.onrender.com/api/docs)

Ali é possível visualizar todos os endpoints, schemas de entrada/saída e executar requisições de teste diretamente pelo navegador ("Try it out").

## Tratamento global de erros

Todas as respostas de erro passam pelo middleware central (`src/middlewares/errorHandler.js`), que traduz falhas internas em respostas JSON amigáveis e com o status HTTP correto:

| Situação | Status | Corpo da resposta |
|---|---|---|
| Validação de DTO (Joi) — body, query ou params inválidos | `400` | `{ "message": "Erro de validação.", "errors": [...] }` |
| JSON malformado no corpo da requisição | `400` | `{ "message": "Corpo da requisição contém JSON inválido." }` |
| Referência inválida (ex.: `profileId`/`technologyIds` inexistentes) | `400` | `{ "message": "..." }` |
| Recurso não encontrado (perfil/projeto por id) | `404` | `{ "message": "Projeto não encontrado." }` |
| Violação de unicidade (email/tecnologia duplicados) | `409` | `{ "message": "...", "errors": [...] }` |
| Rota inexistente | `404` | `{ "message": "Rota não encontrada." }` |
| Erro inesperado do servidor | `500` | `{ "message": "Erro interno do servidor." }` |

## Testes automatizados

Testes de integração (Jest + Supertest) cobrem os 8 endpoints implementados, incluindo casos de sucesso, validação e erro (400/404/409) — 25 testes ao todo, em 3 suítes (`profile`, `technology`, `project`).

Os testes rodam contra um banco PostgreSQL isolado (`devshowcase_test`, criado automaticamente pelo `docker-compose.yml`), não contra o banco de desenvolvimento. Suba o Postgres antes de testar:

```bash
docker compose up -d postgres   # garante o Postgres (e o banco devshowcase_test) disponível em localhost:5432
npm test
```

Por padrão os testes usam `postgres://postgres:postgres@localhost:5432/devshowcase_test`; defina `TEST_DATABASE_URL` no ambiente para apontar para outro banco.

## Deploy em produção

🔗 A API já está publicada em produção: **[https://devshowcase-api-z5wy.onrender.com](https://devshowcase-api-z5wy.onrender.com)** (Swagger UI em [`/api/docs`](https://devshowcase-api-z5wy.onrender.com/api/docs)).

O [`render.yaml`](render.yaml) deste repositório é um **Blueprint** do Render que provisiona, em um único passo, a API web e o banco PostgreSQL, já conectados entre si.

### Opção A — Blueprint (API + PostgreSQL do Render, recomendado)

1. Suba este repositório no GitHub (se ainda não estiver lá).
2. No [Render Dashboard](https://dashboard.render.com), escolha **New → Blueprint** e aponte para o repositório. O Render lê o [`render.yaml`](render.yaml) e cria:
   - o banco `devshowcase-db` (plano Free, região Oregon);
   - o serviço web `devshowcase-api` (`buildCommand: npm install`, `startCommand: node src/server.js`), com `DATABASE_URL` preenchida automaticamente a partir do banco criado (`fromDatabase`) e `DB_SSL=true`.
3. `autoDeploy: true` garante que cada `git push` na branch configurada dispara um novo deploy automaticamente.
4. Ao final do deploy, a API estará disponível em `https://<nome-do-serviço>.onrender.com`, com Swagger UI em `https://<nome-do-serviço>.onrender.com/api/docs`.

### Opção B — Banco no Supabase (ou PostgreSQL do Render criado manualmente)

Use esta opção se preferir manter o banco fora do Render (ex.: Supabase, que não expira após 30 dias no plano gratuito).

1. Provisione um banco PostgreSQL gratuito:
   - **[Supabase](https://supabase.com)** — crie um projeto, copie a *Connection string* (modo "Transaction" ou "Session") em Project Settings → Database.
   - **[Render PostgreSQL](https://render.com)** — crie um banco gerenciado (New → PostgreSQL) e copie a *External Connection String*.
2. Suba este repositório no GitHub e crie o serviço no Render em **New → Web Service** (sem usar o Blueprint), com `buildCommand: npm install` e `startCommand: node src/server.js`.
3. Configure as variáveis de ambiente de produção no dashboard do serviço (Environment):

   | Variável | Valor |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | connection string do Supabase/Render PostgreSQL |
   | `DB_SSL` | `true` |

   O Render injeta automaticamente a variável `PORT` — o servidor (`src/server.js`) já respeita `process.env.PORT`.

> Nunca commitar credenciais de banco no repositório. Na Opção A, o Render gerencia a connection string internamente (`fromDatabase`); na Opção B, `DATABASE_URL` é definida manualmente no dashboard.

## Solução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| `DATABASE_URL não definida` ao subir a API | `.env` ausente ou variável não configurada | `cp .env.example .env` e defina `DATABASE_URL` (ou use `docker compose up`, que já injeta a variável) |
| Erro ao rodar a imagem com `docker run` direto | Variáveis de ambiente do serviço `api` só existem via Compose | Use `docker compose up --build` em vez de `docker run` na imagem isolada |
| `GET /api/technologies` ou `/api/projects` retornam `[]` | Banco recém-criado, sem registros | Normal em um banco novo; cadastre dados via `POST` ou rode `npm run demo` |
| Testes falham por timeout/conexão recusada | PostgreSQL de teste não está rodando | `docker compose up -d postgres` antes de `npm test` |
| Porta `3555` já em uso | Outro processo/serviço ocupando a porta | Altere `PORT` no `.env` (e em `docker-compose.yml`, se necessário) |
| `self signed certificate` / erro de SSL ao conectar no Supabase/Render em produção | `DB_SSL` não definida | Defina `DB_SSL=true` nas variáveis de ambiente de produção |

## Próximas etapas

- Autenticação/autorização para os endpoints de escrita.
- Cache de listagens (`GET /api/projects`) para reduzir carga no banco em produção.
- Pipeline de CI (lint + testes) no GitHub Actions antes do deploy automático no Render.

