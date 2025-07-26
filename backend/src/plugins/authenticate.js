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

      // Adicione logs para depuração
      console.log('Autenticando requisição. Token recebido:', token.substring(0, 30) + '...');

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_forte_teste');

      console.log('Token decodificado:', decoded); // Verifique o conteúdo do decoded object

      // CORREÇÃO AQUI: ANEXE O ID DO USUÁRIO AO request.user.sub
      request.user = { sub: decoded.id }; // Mude de 'id' para 'sub'

      console.log('request.user populado:', request.user);

    } catch (err) {
      console.error('Erro na autenticação JWT:', err.message);
      reply.status(401).send({ error: 'Não autorizado: ' + err.message });
    }
  });
}

export default fp(authenticatePlugin);