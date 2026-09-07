const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

async function createProfile(overrides = {}) {
  const res = await request(app)
    .post('/api/profiles')
    .send({ name: 'Ana Souza', email: 'ana@example.com', ...overrides });
  return res.body;
}

async function createTechnology(name) {
  const res = await request(app).post('/api/technologies').send({ name });
  return res.body;
}

describe('POST /api/projects', () => {
  it('cria um projeto com dados válidos e tecnologias', async () => {
    const profile = await createProfile();
    const tech = await createTechnology('Node.js');

    const res = await request(app).post('/api/projects').send({
      title: 'DevShowcase API',
      description: 'Backend do projeto',
      repositoryUrl: 'https://github.com/ana/devshowcase',
      profileId: profile.id,
      technologyIds: [tech.id],
    });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('DevShowcase API');
    expect(res.body.profile.id).toBe(profile.id);
    expect(res.body.technologies).toHaveLength(1);
    expect(res.body.technologies[0].name).toBe('Node.js');
  });

  it('rejeita título vazio', async () => {
    const profile = await createProfile();

    const res = await request(app).post('/api/projects').send({
      title: '',
      repositoryUrl: 'https://github.com/ana/devshowcase',
      profileId: profile.id,
    });

    expect(res.status).toBe(400);
  });

  it('rejeita repositoryUrl inválida', async () => {
    const profile = await createProfile();

    const res = await request(app).post('/api/projects').send({
      title: 'Projeto X',
      repositoryUrl: 'nao-e-url',
      profileId: profile.id,
    });

    expect(res.status).toBe(400);
  });

  it('rejeita profileId inexistente', async () => {
    const res = await request(app).post('/api/projects').send({
      title: 'Projeto X',
      repositoryUrl: 'https://github.com/ana/devshowcase',
      profileId: 999999,
    });

    expect(res.status).toBe(400);
  });

  it('rejeita technologyIds inexistentes', async () => {
    const profile = await createProfile();

    const res = await request(app).post('/api/projects').send({
      title: 'Projeto X',
      repositoryUrl: 'https://github.com/ana/devshowcase',
      profileId: profile.id,
      technologyIds: [999999],
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/projects', () => {
  it('lista todos os projetos paginados', async () => {
    const profile = await createProfile();
    await request(app).post('/api/projects').send({
      title: 'Projeto 1',
      repositoryUrl: 'https://github.com/ana/projeto1',
      profileId: profile.id,
    });
    await request(app).post('/api/projects').send({
      title: 'Projeto 2',
      repositoryUrl: 'https://github.com/ana/projeto2',
      profileId: profile.id,
    });

    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 10, total: 2, totalPages: 1 });
  });

  it('filtra projetos por profileId', async () => {
    const profile1 = await createProfile();
    const profile2 = await createProfile({ email: 'outra@example.com' });

    await request(app).post('/api/projects').send({
      title: 'Projeto do perfil 1',
      repositoryUrl: 'https://github.com/ana/p1',
      profileId: profile1.id,
    });
    await request(app).post('/api/projects').send({
      title: 'Projeto do perfil 2',
      repositoryUrl: 'https://github.com/ana/p2',
      profileId: profile2.id,
    });

    const res = await request(app).get(`/api/projects?profileId=${profile1.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Projeto do perfil 1');
  });

  it('filtra projetos por tecnologia', async () => {
    const profile = await createProfile();
    const node = await createTechnology('Node.js');
    const react = await createTechnology('React');

    await request(app).post('/api/projects').send({
      title: 'API em Node',
      repositoryUrl: 'https://github.com/ana/api-node',
      profileId: profile.id,
      technologyIds: [node.id],
    });
    await request(app).post('/api/projects').send({
      title: 'Front em React',
      repositoryUrl: 'https://github.com/ana/front-react',
      profileId: profile.id,
      technologyIds: [react.id],
    });

    const res = await request(app).get('/api/projects?technology=Node');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('API em Node');
  });

  it('pagina os resultados com page e limit', async () => {
    const profile = await createProfile();
    for (let i = 1; i <= 3; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post('/api/projects').send({
        title: `Projeto ${i}`,
        repositoryUrl: `https://github.com/ana/projeto${i}`,
        profileId: profile.id,
      });
    }

    const res = await request(app).get('/api/projects?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });
});

describe('POST /api/projects/:id/feedbacks', () => {
  it('cadastra feedback e atualiza a nota média do projeto', async () => {
    const profile = await createProfile();
    const project = await request(app).post('/api/projects').send({
      title: 'Projeto com feedback',
      repositoryUrl: 'https://github.com/ana/projeto-feedback',
      profileId: profile.id,
    });

    const res1 = await request(app)
      .post(`/api/projects/${project.body.id}/feedbacks`)
      .send({ rating: 5, comment: 'Excelente!' });
    expect(res1.status).toBe(201);
    expect(res1.body.projectAverageRating).toBe(5);

    const res2 = await request(app)
      .post(`/api/projects/${project.body.id}/feedbacks`)
      .send({ rating: 3, comment: 'Bom, mas pode melhorar.' });
    expect(res2.status).toBe(201);
    expect(res2.body.projectAverageRating).toBe(4);
  });

  it('rejeita rating fora do intervalo 1-5', async () => {
    const profile = await createProfile();
    const project = await request(app).post('/api/projects').send({
      title: 'Projeto X',
      repositoryUrl: 'https://github.com/ana/projeto-x',
      profileId: profile.id,
    });

    const res = await request(app)
      .post(`/api/projects/${project.body.id}/feedbacks`)
      .send({ rating: 10, comment: 'Nota inválida' });

    expect(res.status).toBe(400);
  });

  it('retorna 404 para projeto inexistente', async () => {
    const res = await request(app)
      .post('/api/projects/999999/feedbacks')
      .send({ rating: 5, comment: 'Ótimo' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/projects/:id/upvote', () => {
  it('incrementa o contador de upvotes do projeto', async () => {
    const profile = await createProfile();
    const project = await request(app).post('/api/projects').send({
      title: 'Projeto para upvote',
      repositoryUrl: 'https://github.com/ana/projeto-upvote',
      profileId: profile.id,
    });

    const res1 = await request(app).put(`/api/projects/${project.body.id}/upvote`);
    expect(res1.status).toBe(200);
    expect(res1.body.upvotes).toBe(1);

    const res2 = await request(app).put(`/api/projects/${project.body.id}/upvote`);
    expect(res2.body.upvotes).toBe(2);
  });

  it('retorna 404 para projeto inexistente', async () => {
    const res = await request(app).put('/api/projects/999999/upvote');
    expect(res.status).toBe(404);
  });
});
