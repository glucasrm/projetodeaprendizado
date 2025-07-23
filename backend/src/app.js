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

// Importações da API de Amizade
import friendshipRoutes from './routes/friendship-routes.js';
import FriendshipController from './controllers/friendship-controller.js'; // Importa a CLASSE FriendshipController

// Importação do serviço de notificação para o FriendshipController
import NotificationService from './services/notificações-services.js';

// Importação das rotas e controller de Usuários
import userRoutes from './routes/user-routes.js'; // Importa o arquivo de rotas de usuário
import UserController from './controllers/user-controller.js'; // Importa a CLASSE UserController

// Importação das rotas de Notificações (Adicionado)
import notificationsRoutes from './routes/notifications-routes.js';

// Ajuda a resolver __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify({ logger: true });

// Registro do fastify-static para servir arquivos da pasta 'public'
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
  origin: '*', // ou defina conforme necessário
});

// O plugin do Prisma deve ser AWAITADO para garantir que `fastify.prisma` esteja disponível.
await app.register(prismaPlugin);
app.register(authenticatePlugin);

// Instanciando Controllers APÓS o plugin do Prisma ter sido completamente registrado.
// Isso garante que `app.prisma` esteja disponível.
const userControllerInstance = new UserController(app.prisma);

// Instanciando NotificationService
// O NotificationService precisa do Prisma, então passamos app.prisma para ele.
const notificationServiceInstance = new NotificationService(app.prisma);

// Instanciando FriendshipController
// O FriendshipController precisa do Prisma e do NotificationService, então passamos ambos.
const friendshipControllerInstance = new FriendshipController(app.prisma, notificationServiceInstance);


// Registro das rotas existentes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(profileRoutes, { prefix: '/api/profile' });
app.register(accountRoutes, { prefix: '/api/account' });
app.register(socialLinksRoutes, { prefix: '/api/profile' });

// Registro das novas rotas da API de Amizade
app.register(friendshipRoutes, { prefix: '/api/friendship', friendshipController: friendshipControllerInstance });

// Registro das rotas de Usuários
app.register(userRoutes, { prefix: '/api/users', userController: userControllerInstance });

// Registro das rotas de Notificações (Adicionado/Verificado)
app.register(notificationsRoutes, { prefix: '/api' });


// Rota de health check (opcional, mas útil para verificar o status da API)
app.get('/health', async (request, reply) => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Middleware de tratamento de erros (adaptado do server.js original)
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