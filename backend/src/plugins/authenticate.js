// src/plugins/authenticate.js
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';

async function authenticatePlugin(fastify, options) {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token de autenticação não fornecido ou inválido.');
      }

      const token = authHeader.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_forte_teste');

      // Anexa o userId ao objeto request para uso nas rotas
      // ESTÁ CORRETO: O ID do usuário autenticado é definido em request.user.id
      request.user = { id: decoded.id };

    } catch (err) {
      reply.status(401).send({ error: 'Não autorizado: ' + err.message });
    }
  });
}

export default fp(authenticatePlugin);