/**
 * Script de demonstração manual da API para apresentação.
 *
 * Como usar:
 *   1) Em um terminal: npm run dev   (ou npm start)
 *   2) Em outro terminal: npm run demo
 *
 * O script chama, em sequência, todos os endpoints implementados contra o
 * servidor real (não usa banco de teste isolado) e imprime no console a
 * requisição enviada e a resposta recebida da API.
 */

const BASE_URL = process.env.DEMO_BASE_URL || `http://localhost:${process.env.PORT || 3555}/api`;

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function paint(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function statusColor(status) {
  return status >= 200 && status < 300 ? 'green' : 'red';
}

function section(title) {
  console.log('\n' + paint('bold', paint('yellow', `--- ${title} ---`)));
}

async function call(method, path, body) {
  const title = `${method} ${path}`;
  console.log('\n' + paint('bold', paint('cyan', `→ ${title}`)));
  if (body) {
    console.log(paint('cyan', 'Body enviado:'));
    console.log(JSON.stringify(body, null, 2));
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  console.log(paint(statusColor(res.status), `← Status ${res.status}`));
  console.log('Resposta:');
  console.log(JSON.stringify(data, null, 2));

  return { status: res.status, data };
}

async function main() {
  console.log(paint('bold', `\n=== Demonstração da DevShowcase API (${BASE_URL}) ===`));

  section('1) Profiles — cadastro e busca por id');
  const profileRes = await call('POST', '/profiles', {
    name: 'Ana Souza',
    email: `ana.${Date.now()}@example.com`,
    bio: 'Dev backend apaixonada por APIs',
    avatarUrl: 'https://example.com/ana.png',
  });
  const profileId = profileRes.data?.id;

  await call('GET', `/profiles/${profileId}`);

  section('2) Technologies — cadastro e listagem');
  const technologyName = `Node.js-${Date.now()}`;
  const techRes = await call('POST', '/technologies', {
    name: technologyName,
  });
  const technologyId = techRes.data?.id;

  await call('GET', '/technologies');

  section('3) Projects — cadastro (vinculando profile + technology) e listagem');
  const projectRes = await call('POST', '/projects', {
    title: 'DevShowcase API',
    description: 'Backend do projeto apresentado em aula',
    repositoryUrl: 'https://github.com/ana/devshowcase',
    profileId,
    technologyIds: technologyId ? [technologyId] : [],
  });
  const projectId = projectRes.data?.id;

  await call('GET', '/projects');

  section('4) Relacionamento Profile 1:N Project — o perfil agora lista o projeto criado');
  await call('GET', `/profiles/${profileId}`);

  section('5) Feedbacks — nota (1 a 5) + comentário, recalculando a nota média do projeto');
  await call('POST', `/projects/${projectId}/feedbacks`, { rating: 5, comment: 'Excelente projeto!' });
  await call('POST', `/projects/${projectId}/feedbacks`, { rating: 3, comment: 'Bom, mas pode melhorar.' });

  section('6) Upvote — incrementa as curtidas/estrelas do projeto');
  await call('PUT', `/projects/${projectId}/upvote`);

  section('7) Filtragem por tecnologia e paginação em GET /api/projects');
  await call('GET', `/projects?technology=${encodeURIComponent(technologyName)}&page=1&limit=5`);

  section('8) Validação de DTOs — exemplos de erro (400)');
  await call('POST', '/profiles', {
    email: 'nao-e-um-email-valido',
  });
  await call('POST', '/projects', {
    title: '',
    repositoryUrl: 'nao-e-uma-url',
    profileId: 999999,
  });
  await call('POST', `/projects/${projectId}/feedbacks`, { rating: 10, comment: 'Nota inválida' });

  console.log(paint('bold', paint('green', '\n=== Demonstração concluída ===\n')));
}

main().catch((err) => {
  console.error(paint('red', '\nFalha ao executar a demonstração.'));
  if (err.cause?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED') {
    console.error(paint('yellow', `Não foi possível conectar em ${BASE_URL}.`));
    console.error(paint('yellow', 'Certifique-se de que o servidor está rodando (npm run dev) antes de executar o demo.'));
  } else {
    console.error(err);
  }
  process.exit(1);
});
