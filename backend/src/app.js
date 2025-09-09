// src/server.js (ou index.js, app.js)

import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

// Plugins e Rotas
import prismaPlugin from './plugins/prisma.js';
import authenticatePlugin from './plugins/authenticate.js';
import authRoutes from './routes/auth-routes.js';
import { profileRoutes } from './controllers/profile-controler.js';
import { accountRoutes } from './controllers/account-controller.js';
import { socialLinksRoutes } from './controllers/social-links-controller.js';
import friendshipRoutes from './routes/friendship-routes.js';
import userRoutes from './routes/user-routes.js';
import notificationsRoutes from './routes/notifications-routes.js';
import matchmakingRoutes from './routes/matchmaking-routes.js';

// Serviços e Controladores
import NotificationService from './services/notification-services.js';
import MatchmakingService from './services/matchmaking-service.js';
import FriendshipController from './controllers/friendship-controller.js';
import UserController from './controllers/user-controller.js';
import TournamentService from './services/tournament-service.js';
import tournamentRoutes from './routes/tournament-routes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify({ logger: true });

// --- REGISTRO DE PLUGINS E MIDDLEWARE ---
app.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/public/',
});

await app.register(fastifyMultipart, {
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
} );

await app.register(prismaPlugin);
app.register(authenticatePlugin);


// --- INICIALIZAÇÃO E INJEÇÃO DE DEPENDÊNCIAS ---

// 1. Crie instâncias de todos os serviços necessários.
const notificationServiceInstance = new NotificationService(app.prisma);
const matchmakingServiceInstance = new MatchmakingService(app.prisma, notificationServiceInstance);
const tournamentServiceInstance = new TournamentService(app.prisma); // Nova instância


// 2. Crie instâncias dos controladores que dependem de serviços.
const userControllerInstance = new UserController(app.prisma);
const friendshipControllerInstance = new FriendshipController(app.prisma, notificationServiceInstance);


// --- REGISTRO DE ROTAS (PASSANDO DEPENDÊNCIAS) ---

app.register(authRoutes, { prefix: '/api/auth' });
app.register(profileRoutes, { prefix: '/api/profile' });
app.register(accountRoutes, { prefix: '/api/account' });
app.register(socialLinksRoutes, { prefix: '/api/profile' });
app.register(userRoutes, { prefix: '/api/users', userController: userControllerInstance });
app.register(notificationsRoutes, { prefix: '/api' });
app.register(friendshipRoutes, { prefix: '/api/friendship', friendshipController: friendshipControllerInstance });

// Passe a instância do matchmakingService para as rotas de matchmaking.
app.register(matchmakingRoutes, { 
  prefix: '/api/matchmaking',
  matchmakingService: matchmakingServiceInstance 
});

app.register(tournamentRoutes, {
  prefix: '/api/tournaments',
  tournamentService: tournamentServiceInstance,
});


// --- PROCESSOS EM SEGUNDO PLANO (BACKGROUND) ---

console.log('Iniciando o serviço de matchmaking em segundo plano...');
setInterval(() => {
  try {
    // Chame a função na instância que já tem o notificationService injetado.
    matchmakingServiceInstance.findAndCreateMatches();
  } catch (error) {
    app.log.error('Erro no loop de matchmaking:', error);
  }
}, 10000); // Executa a cada 10 segundos


// --- CONFIGURAÇÕES FINAIS ---

app.get('/health', async (request, reply) => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

app.setErrorHandler(async (error, request, reply) => {
  app.log.error(error);
  if (error.code === 'P2002') {
    return reply.status(409).send({ error: 'Conflito', message: 'Recurso já existe' });
  }
  if (error.code === 'P2025') {
    return reply.status(404).send({ error: 'Não encontrado', message: 'Recurso não encontrado' });
  }
  return reply.status(500).send({ error: 'Erro interno do servidor', message: error.message });
});

export default app;
