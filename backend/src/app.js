import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import authRoutes from './routes/auth-routes.js';
import {profileRoutes} from './controllers/profile-controler.js';
import prismaPlugin from './plugins/prisma.js';
import authenticatePlugin from './plugins/authenticate.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { accountRoutes } from './controllers/account-controller.js';
import {socialLinksRoutes} from './controllers/social-links-controller.js';
import friendshipRoutes from './routes/friendship-routes.js';
import FriendshipController from './controllers/friendship-controller.js';
import NotificationService from './services/notification-services.js';
import userRoutes from './routes/user-routes.js';
import UserController from './controllers/user-controller.js';
import notificationsRoutes from './routes/notifications-routes.js';

// Importação das novas rotas de matchmaking e mediação
import matchmakingRoutes from './routes/matchmaking-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify({ logger: true });

app.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/public/',
});

await app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.register(cors, {
  origin: 'http://localhost:5173', // O domínio do seu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
});

await app.register(prismaPlugin);
app.register(authenticatePlugin);

const userControllerInstance = new UserController(app.prisma);
const notificationServiceInstance = new NotificationService(app.prisma);
const friendshipControllerInstance = new FriendshipController(app.prisma, notificationServiceInstance);

app.register(authRoutes, { prefix: '/api/auth' });
app.register(profileRoutes, { prefix: '/api/profile' });
app.register(accountRoutes, { prefix: '/api/account' });
app.register(socialLinksRoutes, { prefix: '/api/profile' });
app.register(friendshipRoutes, { prefix: '/api/friendship', friendshipController: friendshipControllerInstance });
app.register(userRoutes, { prefix: '/api/users', userController: userControllerInstance });
app.register(notificationsRoutes, { prefix: '/api' });

// Registro das novas rotas de matchmaking e mediação
app.register(matchmakingRoutes, { prefix: '/api/matchmaking' });

app.get('/health', async (request, reply) => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

app.setErrorHandler(async (error, request, reply) => {
  app.log.error(error);

  if (error.code === 'P2002') {
    return reply.status(409).send({
      error: 'Conflito',
      message: 'Recurso já existe'
    });
  }

  if (error.code === 'P2025') {
    return reply.status(404).send({
      error: 'Não encontrado',
      message: 'Recurso não encontrado'
    });
  }

  return reply.status(500).send({
    error: 'Erro interno do servidor',
    message: error.message
  });
});

export default app;

