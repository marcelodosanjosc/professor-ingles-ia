import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Healthcheck', () => {
  it('GET /api/health deve retornar ok: true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('Autenticação e Sessão (/api/auth)', () => {
  const validRegisterPayload = {
    name: 'Carlos Silva',
    email: 'carlos@example.com',
    password: 'senhaSegura123',
  };

  it('POST /api/auth/register cria usuário, seta cookie e retorna PublicUser', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validRegisterPayload);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Carlos Silva');
    expect(res.body.user.email).toBe('carlos@example.com');
    expect(res.body.user.hasProfile).toBe(false);
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.createdAt).toBeDefined();

    const cookies = res.headers['set-cookie'] as string[] | undefined;
    expect(cookies).toBeDefined();
    expect(cookies?.some((c) => c.startsWith('fl_session='))).toBe(true);
  });

  it('POST /api/auth/register falha se e-mail for duplicado (409 EMAIL_TAKEN)', async () => {
    await request(app).post('/api/auth/register').send(validRegisterPayload);

    const res = await request(app)
      .post('/api/auth/register')
      .send(validRegisterPayload);

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('POST /api/auth/register valida payload com Zod (400 VALIDATION_ERROR)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'nao-e-email',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('POST /api/auth/login realiza login com sucesso e seta cookie', async () => {
    await request(app).post('/api/auth/register').send(validRegisterPayload);

    const res = await request(app).post('/api/auth/login').send({
      email: validRegisterPayload.email,
      password: validRegisterPayload.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validRegisterPayload.email);

    const cookies = res.headers['set-cookie'] as string[] | undefined;
    expect(cookies).toBeDefined();
    expect(cookies?.some((c) => c.startsWith('fl_session='))).toBe(true);
  });

  it('POST /api/auth/login rejeita credenciais inválidas com mensagem genérica', async () => {
    await request(app).post('/api/auth/register').send(validRegisterPayload);

    // Senha errada
    const res1 = await request(app).post('/api/auth/login').send({
      email: validRegisterPayload.email,
      password: 'senhaErrada123',
    });
    expect(res1.status).toBe(401);
    expect(res1.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res1.body.error.message).toBe('E-mail ou senha incorretos');

    // Usuário inexistente
    const res2 = await request(app).post('/api/auth/login').send({
      email: 'inexistente@example.com',
      password: 'senhaErrada123',
    });
    expect(res2.status).toBe(401);
    expect(res2.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res2.body.error.message).toBe('E-mail ou senha incorretos');
  });

  it('GET /api/auth/me sem cookie retorna 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/auth/me com cookie de sessão válido retorna usuário atual', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(validRegisterPayload);

    const cookies = regRes.headers['set-cookie'] as unknown as string[];

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(regRes.body.user.id);
    expect(res.body.user.email).toBe(validRegisterPayload.email);
    expect(res.body.user.hasProfile).toBe(false);
  });

  it('POST /api/auth/logout limpa o cookie fl_session e retorna 204', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(validRegisterPayload);

    const cookies = regRes.headers['set-cookie'] as unknown as string[];

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(logoutRes.status).toBe(204);
    const logoutCookies = logoutRes.headers['set-cookie'] as string[] | undefined;
    expect(logoutCookies).toBeDefined();
    expect(logoutCookies?.some((c) => c.includes('fl_session=;'))).toBe(true);
  });
});

describe('Proteção CSRF', () => {
  it('permite requisições não-GET sem header Origin apenas em NODE_ENV=test', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Teste CSRF',
      email: 'csrf-test@example.com',
      password: 'senhaSegura123',
    });
    expect(res.status).toBe(201);
  });

  it('permite requisições não-GET com Origin igual a WEB_ORIGIN', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', 'http://localhost:5173')
      .send({
        name: 'Teste CSRF 2',
        email: 'csrf-test2@example.com',
        password: 'senhaSegura123',
      });
    expect(res.status).toBe(201);
  });

  it('bloqueia requisição não-GET com Origin não autorizado (403 CSRF_FORBIDDEN)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', 'http://malicious-site.com')
      .send({
        name: 'Hacker',
        email: 'hacker@example.com',
        password: 'senhaSegura123',
      });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_FORBIDDEN');
  });
});

describe('Rotas de Perfil (/api/profile)', () => {
  const userPayload = {
    name: 'Ana Onboarding',
    email: 'ana@example.com',
    password: 'senhaSegura123',
  };

  const validProfilePayload = {
    targetLanguage: 'Inglês',
    nativeLanguage: 'Português',
    level: 'A2' as const,
    goal: 'work' as const,
    minutesPerDay: 30,
    deadlineMonths: 6,
    otherLanguages: ['Espanhol'],
    mainDifficulty: 'speaking' as const,
    interests: ['tecnologia', 'viagem'],
    routine: 'work' as const,
    hardSounds: 'th, r caipira vs flap',
    blockSituations: 'reuniões em inglês',
  };

  it('GET /api/profile sem autenticação retorna 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/profile para usuário sem perfil retorna 404 NO_PROFILE', async () => {
    const regRes = await request(app).post('/api/auth/register').send(userPayload);
    const cookies = regRes.headers['set-cookie'] as unknown as string[];

    const res = await request(app)
      .get('/api/profile')
      .set('Cookie', cookies);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NO_PROFILE');
  });

  it('PUT /api/profile valida entrada com Zod (400 VALIDATION_ERROR)', async () => {
    const regRes = await request(app).post('/api/auth/register').send(userPayload);
    const cookies = regRes.headers['set-cookie'] as unknown as string[];

    const res = await request(app)
      .put('/api/profile')
      .set('Cookie', cookies)
      .send({
        targetLanguage: '',
        minutesPerDay: 2, // min é 5
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/profile cria perfil e GET /api/profile retorna dados corretos', async () => {
    const regRes = await request(app).post('/api/auth/register').send(userPayload);
    const cookies = regRes.headers['set-cookie'] as unknown as string[];

    const putRes = await request(app)
      .put('/api/profile')
      .set('Cookie', cookies)
      .send(validProfilePayload);

    expect(putRes.status).toBe(200);
    expect(putRes.body.profile).toBeDefined();
    expect(putRes.body.profile.targetLanguage).toBe('Inglês');
    expect(putRes.body.profile.level).toBe('A2');
    expect(putRes.body.profile.minutesPerDay).toBe(30);
    expect(putRes.body.profile.interests).toEqual(['tecnologia', 'viagem']);
    expect(putRes.body.profile.otherLanguages).toEqual(['Espanhol']);

    // Verifica que GET /api/profile retorna o mesmo perfil
    const getRes = await request(app)
      .get('/api/profile')
      .set('Cookie', cookies);

    expect(getRes.status).toBe(200);
    expect(getRes.body.profile.id).toBe(putRes.body.profile.id);
    expect(getRes.body.profile.hardSounds).toBe('th, r caipira vs flap');

    // Verifica que GET /api/auth/me agora indica hasProfile: true
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.hasProfile).toBe(true);
  });

  it('PUT /api/profile atualiza perfil existente idempotentemente', async () => {
    const regRes = await request(app).post('/api/auth/register').send(userPayload);
    const cookies = regRes.headers['set-cookie'] as unknown as string[];

    await request(app)
      .put('/api/profile')
      .set('Cookie', cookies)
      .send(validProfilePayload);

    const updatePayload = {
      ...validProfilePayload,
      level: 'B1' as const,
      minutesPerDay: 45,
    };

    const updateRes = await request(app)
      .put('/api/profile')
      .set('Cookie', cookies)
      .send(updatePayload);

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.profile.level).toBe('B1');
    expect(updateRes.body.profile.minutesPerDay).toBe(45);
  });
});
