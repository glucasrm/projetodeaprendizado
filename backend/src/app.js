// src/app.js
import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static'; // <-- NOVA IMPORTAÇÃO
import authRoutes from './routes/auth-routes.js';
import {profileRoutes} from './controllers/profile-controler.js'
import prismaPlugin from './plugins/prisma.js';
import authenticatePlugin from './plugins/authenticate.js';
import path from 'path'; // <-- NOVA IMPORTAÇÃO para resolver caminhos
import { fileURLToPath } from 'url'; // <-- NOVA IMPORTAÇÃO para ES Modules
import { accountRoutes } from './controllers/account-controller.js'; //nova importação das configurações do perfil
import { socialLinksRoutes } from './controllers/social-links-controller.js'; //nova importação das redes sociais no perfil

// Ajuda a resolver __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify({ logger: true });

// Registro do fastify-static para servir arquivos da pasta 'public'
app.register(fastifyStatic, {
  root: path.join(__dirname, '../public'), // Aponta para a pasta 'public' na raiz do backend
  prefix: '/public/', // URL prefixo para acessar os arquivos estáticos
});

await app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024 // limite de 10 MB por arquivo
  }
});

app.register(cors, {
  origin: '*', // ou defina conforme necessário
});

app.register(prismaPlugin);
app.register(authenticatePlugin);

app.register(authRoutes, { prefix: '/api/auth' });
app.register(profileRoutes, { prefix: '/api/profile' });
app.register(accountRoutes, { prefix: '/api/account' });
app.register(socialLinksRoutes, { prefix: '/api/profile' });


export default app;
