/**
 * Especificação OpenAPI 3.0 da DevShowcase API, servida via Swagger UI em /api/docs.
 */
const packageJson = require('../../package.json');

const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'DevShowcase API',
    version: packageJson.version,
    description:
      'API para desenvolvedores exibirem perfis, projetos, tecnologias e receberem feedback (notas e comentários) da comunidade.',
  },
  servers: [{ url: '/api', description: 'Prefixo base da API' }],
  tags: [
    { name: 'Profiles' },
    { name: 'Technologies' },
    { name: 'Projects' },
    { name: 'Feedbacks' },
  ],
  paths: {
    '/profiles': {
      post: {
        tags: ['Profiles'],
        summary: 'Cadastra um novo perfil de desenvolvedor',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProfileInput' },
            },
          },
        },
        responses: {
          201: { description: 'Perfil criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } } },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/ConflictError' },
        },
      },
    },
    '/profiles/{id}': {
      get: {
        tags: ['Profiles'],
        summary: 'Busca um perfil por id',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Perfil encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } } },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/technologies': {
      post: {
        tags: ['Technologies'],
        summary: 'Cadastra uma nova tecnologia',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTechnologyInput' } } },
        },
        responses: {
          201: { description: 'Tecnologia criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Technology' } } } },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/ConflictError' },
        },
      },
      get: {
        tags: ['Technologies'],
        summary: 'Lista todas as tecnologias cadastradas',
        responses: {
          200: {
            description: 'Lista de tecnologias',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Technology' } } } },
          },
        },
      },
    },
    '/projects': {
      post: {
        tags: ['Projects'],
        summary: 'Cadastra um novo projeto',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProjectInput' } } },
        },
        responses: {
          201: { description: 'Projeto criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
      get: {
        tags: ['Projects'],
        summary: 'Lista projetos com filtro por tecnologia e paginação',
        parameters: [
          { name: 'profileId', in: 'query', schema: { type: 'integer' }, description: 'Filtra projetos de um perfil específico' },
          { name: 'technology', in: 'query', schema: { type: 'string' }, description: 'Filtra projetos que usam a tecnologia informada (busca parcial, case-insensitive)' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 } },
        ],
        responses: {
          200: {
            description: 'Lista paginada de projetos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/projects/{id}/feedbacks': {
      post: {
        tags: ['Feedbacks'],
        summary: 'Registra uma nota (1 a 5) e comentário para o projeto, recalculando a nota média',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFeedbackInput' } } },
        },
        responses: {
          201: {
            description: 'Feedback registrado e nota média do projeto atualizada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    feedback: { $ref: '#/components/schemas/Feedback' },
                    projectAverageRating: { type: 'number', example: 4.5 },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/projects/{id}/upvote': {
      put: {
        tags: ['Projects'],
        summary: 'Incrementa em 1 a contagem de curtidas/estrelas (upvotes) do projeto',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Projeto com upvotes atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
  },
  components: {
    parameters: {
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
    },
    responses: {
      ValidationError: {
        description: 'Erro de validação dos dados enviados',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Erro de validação.' },
                errors: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: { type: 'object', properties: { message: { type: 'string', example: 'Projeto não encontrado.' } } },
          },
        },
      },
      ConflictError: {
        description: 'Conflito: recurso já existe',
        content: {
          'application/json': {
            schema: { type: 'object', properties: { message: { type: 'string' } } },
          },
        },
      },
    },
    schemas: {
      CreateProfileInput: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', example: 'Ana Souza' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          bio: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
          bio: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', nullable: true },
          projects: { type: 'array', items: { type: 'object' } },
        },
      },
      CreateTechnologyInput: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', example: 'Node.js' } },
      },
      Technology: {
        type: 'object',
        properties: { id: { type: 'integer' }, name: { type: 'string' } },
      },
      CreateProjectInput: {
        type: 'object',
        required: ['title', 'repositoryUrl', 'profileId'],
        properties: {
          title: { type: 'string', example: 'DevShowcase API' },
          description: { type: 'string', nullable: true },
          repositoryUrl: { type: 'string', format: 'uri', example: 'https://github.com/ana/devshowcase' },
          profileId: { type: 'integer', example: 1 },
          technologyIds: { type: 'array', items: { type: 'integer' }, example: [1, 2] },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          repositoryUrl: { type: 'string' },
          averageRating: { type: 'number', example: 4.5 },
          upvotes: { type: 'integer', example: 3 },
          profile: { type: 'object' },
          technologies: { type: 'array', items: { $ref: '#/components/schemas/Technology' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateFeedbackInput: {
        type: 'object',
        required: ['rating', 'comment'],
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', example: 'Excelente projeto!' },
        },
      },
      Feedback: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          rating: { type: 'integer' },
          comment: { type: 'string' },
          projectId: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
    },
  },
};

module.exports = openapiSpec;
